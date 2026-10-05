import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, User, Loader2, Check, ShoppingBag } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";

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

function SocialLogin() {
  const [note, setNote] = useState(false);
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={() => setNote(true)}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border bg-card font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continue with Google
      </button>
      {note && <p className="mt-2 text-center text-xs text-muted-foreground">Google sign-in will be connected soon.</p>}
    </>
  );
}

type Errs = { name?: string; email?: string; password?: string; confirm?: string };

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const fakeAuth = () => new Promise((r) => setTimeout(r, 1300));

function LoginForm({ passwordVisible, onToggleVisible, onPasswordFocus }: PasswordHandlers) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const errs: Errs = {};
    if (!email) errs.email = "Please enter your email.";
    else if (!emailOk(email)) errs.email = "That email doesn't look right.";
    if (!password) errs.password = "Please enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await fakeAuth();
    setLoading(false);
    setSuccess(true);
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field id="email" label="Email" error={errors.email}>
        <TextInput id="email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={loading} />
      </Field>
      <Field id="password" label="Password" error={errors.password} aside={<a href="#" className="text-xs font-semibold text-brand hover:underline">Forgot password?</a>}>
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

function SignupForm({ passwordVisible, onToggleVisible, onPasswordFocus }: PasswordHandlers) {
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const errs: Errs = {};
    if (!v.name.trim()) errs.name = "Tell us your name.";
    if (!v.email) errs.email = "Please enter your email.";
    else if (!emailOk(v.email)) errs.email = "That email doesn't look right.";
    if (!v.password) errs.password = "Choose a password.";
    else if (v.password.length < 8 || !/\d/.test(v.password) || !/[A-Za-z]/.test(v.password))
      errs.password = "Use 8+ characters with letters and a number.";
    if (!v.confirm) errs.confirm = "Please confirm your password.";
    else if (v.confirm !== v.password) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await fakeAuth();
    setLoading(false);
    setSuccess(true);
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-3.5">
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
      <div className="pt-1"><PrimaryButton loading={loading} success={success}>Create account</PrimaryButton></div>
    </form>
  );
}

export function AuthPanel(props: PasswordHandlers & { mode: AuthMode; onModeChange: (m: AuthMode) => void }) {
  const { mode, onModeChange, ...pw } = props;
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

          {login ? <LoginForm {...pw} /> : <SignupForm {...pw} />}

          <SocialLogin />

          <p className="mt-7 text-center text-sm text-muted-foreground">
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
