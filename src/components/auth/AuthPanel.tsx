import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, User, Loader2, Check, ShoppingBag, Info, TriangleAlert } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { login as loginFn, signup as signupFn, type PublicUser } from "@/lib/api/auth";
import { useStore } from "@/lib/store";

export type AuthMode = "login" | "signup";

type PasswordHandlers = {
  passwordVisible: boolean;
  onToggleVisible: () => void;
  onPasswordFocus: (focused: boolean) => void;
};

const inputCls =
  "h-12 w-full rounded-xl border bg-card px-4 pl-11 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15";

function Field({ id, label, error, aside, children }: { id: string; label: string; error?: string | undefined; aside?: ReactNode | undefined; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
        {aside}
      </div>
      {children}
      {error && <p id={`${id}-err`} className="animate-in fade-in-0 slide-in-from-top-1 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function TextInput({ icon, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode; error?: string | undefined }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input {...props} aria-invalid={!!error} aria-describedby={error ? `${props.id}-err` : undefined} className={inputCls} />
    </div>
  );
}

function PasswordInput({ id, value, onChange, error, disabled, visible, onToggle, onFocusChange, placeholder, autoComplete }: {
  id: string; value: string; onChange: (v: string) => void; error?: string | undefined; disabled?: boolean | undefined; visible: boolean;
  onToggle: () => void; onFocusChange: (f: boolean) => void; placeholder: string; autoComplete: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
      </span>
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`${inputCls} pr-12`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function PrimaryButton({ loading, success, children }: { loading: boolean; success: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading || success}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground shadow-[var(--shadow-button)] transition hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : success ? <Check size={18} /> : null}
      {success ? "Welcome to MarketHub" : children}
    </button>
  );
}

/** Server-side rejections: wrong credentials, duplicate email, rate limit. */
function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive">
      <TriangleAlert size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/**
 * Server functions reject with an Error whose message is already safe to show —
 * `guarded()` in src/lib/server/validate.ts only lets curated `AppError` text
 * through and replaces anything unexpected with a generic sentence. So there is
 * no stack trace or internal detail to filter out here, but an empty or
 * suspiciously long message still falls back to generic copy.
 */
function messageFor(error: unknown): string {
  const raw = error instanceof Error ? error.message.trim() : "";
  if (!raw || raw.length > 200) return "Something went wrong. Please try again.";
  return raw;
}

/**
 * Notes that accounts are real but the catalogue is sample data.
 *
 * The previous copy said no password was checked and the session lived only in
 * the browser. Both are now false: passwords are scrypt-hashed server-side and
 * the session is an httpOnly cookie backed by a server-side record, so the
 * notice would have been actively misleading if left alone.
 */
function DemoDataNotice() {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted-foreground">
      <Info size={14} className="mt-0.5 shrink-0 text-info" />
      <span>
        Sign-in is real — passwords are hashed and verified on the server, and
        your role is assigned there. The catalogue and order history are sample
        data for this build.
      </span>
    </p>
  );
}

type Errs = { name?: string; email?: string; password?: string; confirm?: string };

/**
 * Lands the visitor somewhere useful after the server confirms who they are.
 *
 * The destination is chosen from the role the SERVER returned, never from a
 * control on this page. The role picker that used to sit in this form let the
 * visitor select `vendor` and have it written straight into the session; the
 * server now assigns the role and `signup` does not accept one at all.
 */
function useLandAfterAuth(redirect: string) {
  const { refreshUser } = useStore();
  const navigate = useNavigate();

  return async (user: PublicUser) => {
    await refreshUser();
    const fallback = user.role === "vendor" ? "/vendor" : "/";
    const to = redirect || fallback;
    // Let the success state render for a beat before leaving the page.
    setTimeout(() => navigate({ to, replace: true }), 600);
  };
}

function LoginForm({ passwordVisible, onToggleVisible, onPasswordFocus, redirect }: PasswordHandlers & { redirect: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errs>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const land = useLandAfterAuth(redirect);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setFormError("");
    const errs: Errs = {};
    if (!email) errs.email = "Please enter your email.";
    else if (!emailOk(email)) errs.email = "That email doesn't look right.";
    if (!password) errs.password = "Please enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // Client-side checks above are a convenience. The server validates again
      // and is the only thing that decides whether these credentials are good.
      const user = await loginFn({ data: { email: email.trim(), password } });
      setSuccess(true);
      await land(user);
    } catch (error) {
      setFormError(messageFor(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      {formError && <FormError message={formError} />}
      <Field id="email" label="Email" error={errors.email}>
        <TextInput id="email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={loading} />
      </Field>
      <Field id="password" label="Password" error={errors.password} aside={<Link to="/login" className="text-xs font-semibold text-brand hover:underline">Forgot password?</Link>}>
        <PasswordInput id="password" value={password} onChange={setPassword} error={errors.password} disabled={loading} visible={passwordVisible} onToggle={onToggleVisible} onFocusChange={onPasswordFocus} placeholder="Your password" autoComplete="current-password" />
      </Field>
      <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[var(--brand)]" />
        Remember me for 30 days
      </label>
      <PrimaryButton loading={loading} success={success}>Log in</PrimaryButton>
    </form>
  );
}

function SignupForm({ passwordVisible, onToggleVisible, onPasswordFocus, redirect }: PasswordHandlers & { redirect: string }) {
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "" });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errs & { accepted?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const land = useLandAfterAuth(redirect);

  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setFormError("");
    const errs: Errs & { accepted?: string } = {};
    if (!v.name.trim()) errs.name = "Tell us your name.";
    if (!v.email) errs.email = "Please enter your email.";
    else if (!emailOk(v.email)) errs.email = "That email doesn't look right.";
    if (!v.password) errs.password = "Choose a password.";
    else if (v.password.length < 8 || !/\d/.test(v.password) || !/[A-Za-z]/.test(v.password))
      errs.password = "Use 8+ characters with letters and a number.";
    if (!v.confirm) errs.confirm = "Please confirm your password.";
    else if (v.confirm !== v.password) errs.confirm = "Passwords don't match.";
    if (!accepted) errs.accepted = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // No role is sent. New accounts are shoppers; the server decides and will
      // not read a role from this request. Selling requires an application at
      // /vendor-register and a verification step, same as the seeded sellers.
      const user = await signupFn({ data: { name: v.name.trim(), email: v.email.trim(), password: v.password } });
      setSuccess(true);
      await land(user);
    } catch (error) {
      setFormError(messageFor(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-3.5">
      {formError && <FormError message={formError} />}
      <Field id="name" label="Full name" error={errors.name}>
        <TextInput id="name" autoComplete="name" placeholder="Ada Lovelace" icon={<User size={18} />} value={v.name} onChange={(e) => set("name")(e.target.value)} error={errors.name} disabled={loading} />
      </Field>
      <Field id="su-email" label="Email" error={errors.email}>
        <TextInput id="su-email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail size={18} />} value={v.email} onChange={(e) => set("email")(e.target.value)} error={errors.email} disabled={loading} />
      </Field>
      <Field id="su-password" label="Password" error={errors.password}>
        <PasswordInput id="su-password" value={v.password} onChange={set("password")} error={errors.password} disabled={loading} visible={passwordVisible} onToggle={onToggleVisible} onFocusChange={onPasswordFocus} placeholder="8+ characters" autoComplete="new-password" />
      </Field>
      <Field id="su-confirm" label="Confirm password" error={errors.confirm}>
        <PasswordInput id="su-confirm" value={v.confirm} onChange={set("confirm")} error={errors.confirm} disabled={loading} visible={passwordVisible} onToggle={onToggleVisible} onFocusChange={onPasswordFocus} placeholder="Repeat password" autoComplete="new-password" />
      </Field>
      <div className="space-y-1.5 pt-0.5">
        <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-muted-foreground">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} disabled={loading} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--brand)]" />
          <span>
            I agree to the <Link to="/terms" className="font-semibold text-brand hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="font-semibold text-brand hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        {errors.accepted && <p className="text-xs font-medium text-destructive">{errors.accepted}</p>}
      </div>
      <div className="pt-1"><PrimaryButton loading={loading} success={success}>Create account</PrimaryButton></div>
    </form>
  );
}

export function AuthPanel(props: PasswordHandlers & { mode: AuthMode; onModeChange: (m: AuthMode) => void; redirect?: string }) {
  const { mode, onModeChange, redirect = "", ...pw } = props;
  const login = mode === "login";

  return (
    <div className="flex h-full flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
      <div className="mx-auto w-full max-w-sm">
        <Link to="/" className="mb-8 flex w-fit items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><ShoppingBag size={18} /></span>
          <span className="font-display text-lg font-bold tracking-tight">MarketHub</span>
        </Link>

        <div key={mode} className="form-swap">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{login ? "Welcome back!" : "Join the market"}</h1>
          <p className="mb-7 mt-2 text-muted-foreground">{login ? "Sign in to continue to MarketHub." : "Create an account to start shopping smarter."}</p>

          {login ? <LoginForm {...pw} redirect={redirect} /> : <SignupForm {...pw} redirect={redirect} />}

          {/* "Continue with Google" removed: there is no OAuth client behind it.
              It minted a local session under a chosen identity, which is a
              sign-in bypass now that sessions are issued by the server. */}

          <DemoDataNotice />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {login ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => onModeChange(login ? "signup" : "login")} className="rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {login ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
