import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, User, Loader2, Check, ShoppingBag, Store, Shield, Info } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { customers, vendors } from "@/lib/data";
import { useStore, type Role } from "@/lib/store";

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

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const fakeAuth = () => new Promise((r) => setTimeout(r, 1300));

/**
 * Resolves a display name for the signed-in session.
 *
 * Seed accounts keep their real names so the demo is coherent — signing in as a
 * seeded shopper surfaces that shopper's existing orders. Anything else falls
 * back to a title-cased version of the email's local part.
 *
 * Seller emails are matched but never shown or suggested anywhere in the UI;
 * publishing them would hand over a scrapeable list of seller contacts.
 */
function nameForEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const customer = customers.find((c) => c.email.toLowerCase() === e);
  if (customer) return customer.name;
  const vendor = vendors.find((v) => v.email.toLowerCase() === e);
  if (vendor) return vendor.owner;

  const local = e.split("@")[0] ?? "";
  const pretty = local.replace(/[._-]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return pretty || "Shopper";
}

// Admin is deliberately absent: there is no /admin console in this build, so
// offering the role would hand the visitor a route that 404s.
const ROLES: { value: Role; label: string; icon: typeof User }[] = [
  { value: "customer", label: "Shopper", icon: User },
  { value: "vendor", label: "Seller", icon: Store },
];

/**
 * Which workspace to drop into after signing in. MarketHub gates /vendor and
 * /admin on `user.role`, so without this there is no way to reach either in a
 * seeded demo that has no real identity provider behind it.
 */
function RolePicker({ value, onChange, disabled }: { value: Role; onChange: (r: Role) => void; disabled: boolean }) {
  return (
    <fieldset disabled={disabled} className="space-y-1.5">
      <legend className="text-sm font-semibold text-foreground">Sign in as</legend>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map(({ value: v, label, icon: Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:opacity-60 ${
              value === v
                ? "border-brand bg-brand-soft text-brand"
                : "border-input bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * States plainly that this is not real authentication.
 *
 * MarketHub has no identity provider, no password store and no server-side
 * session: `login()` writes a name, email and role into localStorage and the
 * role gates read it back. Anyone can therefore grant themselves any role from
 * devtools. That is acceptable for a demo storefront and unacceptable for
 * anything real, so the UI says so rather than implying a security property it
 * does not have.
 */
function DemoAuthNotice() {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted-foreground">
      <Info size={14} className="mt-0.5 shrink-0 text-info" />
      <span>
        Demo sign-in. No password is checked and the session lives only in this
        browser, so role gates here are navigation, not security.
      </span>
    </p>
  );
}

type Errs = { name?: string; email?: string; password?: string; confirm?: string };

/** Shared by all three entry points: write the session, then land somewhere useful. */
function useSignIn(redirect: string) {
  const { login } = useStore();
  const navigate = useNavigate();

  return (user: { name: string; email: string; role: Role }) => {
    login(user);
    const fallback = user.role === "vendor" ? "/vendor" : user.role === "admin" ? "/admin" : "/";
    const to = redirect || fallback;
    // Let the success state render for a beat before leaving the page.
    setTimeout(() => navigate({ to, replace: true }), 600);
  };
}

function LoginForm({ passwordVisible, onToggleVisible, onPasswordFocus, redirect }: PasswordHandlers & { redirect: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errs>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const signIn = useSignIn(redirect);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
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
    signIn({ name: nameForEmail(email), email: email.trim(), role });
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      <Field id="email" label="Email" error={errors.email}>
        <TextInput id="email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail size={18} />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} disabled={loading} />
      </Field>
      <Field id="password" label="Password" error={errors.password} aside={<Link to="/login" className="text-xs font-semibold text-brand hover:underline">Forgot password?</Link>}>
        <PasswordInput id="password" value={password} onChange={setPassword} error={errors.password} disabled={loading} visible={passwordVisible} onToggle={onToggleVisible} onFocusChange={onPasswordFocus} placeholder="Your password" autoComplete="current-password" />
      </Field>
      <RolePicker value={role} onChange={setRole} disabled={loading || success} />
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const signIn = useSignIn(redirect);

  const set = (k: keyof typeof v) => (val: string) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
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
    await fakeAuth();
    setLoading(false);
    setSuccess(true);
    // New accounts are always shoppers. Selling requires an application at
    // /vendor-register and a verification step, same as the seeded sellers.
    signIn({ name: v.name.trim(), email: v.email.trim(), role: "customer" });
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

function SocialLogin({ redirect, disabled }: { redirect: string; disabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const signIn = useSignIn(redirect);

  // There is no OAuth client behind this. It mints the same local demo session
  // the email form does, under a Google-shaped identity, and says so.
  const go = async () => {
    if (busy || disabled) return;
    setBusy(true);
    await fakeAuth();
    signIn({ name: "Google Guest", email: "guest@gmail.com", role: "customer" });
  };

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={go}
        disabled={busy || disabled}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border bg-card font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        )}
        {busy ? "Signing you in" : "Continue with Google"}
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Simulated for this demo — no Google account is contacted.
      </p>
    </>
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

          <SocialLogin redirect={redirect} disabled={false} />

          <DemoAuthNotice />

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
