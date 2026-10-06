import { __toESM } from "../_runtime.mjs";
import { customers, vendors } from "./data-B5ji5bfz.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useStore } from "./store-Bi6xghwA.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Route$12 } from "./router-C8aofr3U.mjs";
import { Check, Eye, EyeOff, Info, LoaderCircle, Mail, ShoppingBag, Store, User } from "../_libs/lucide-react.mjs";
import { hero_default } from "./hero-DYk0bSyM.mjs";
import { postLoginPath } from "./onboarding-store-BRs06JfO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DL6h8u_a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var inputCls = "h-12 w-full rounded-xl border bg-card px-4 pl-11 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15";
function Field({ id, label, error, aside, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: id,
					className: "text-sm font-semibold text-foreground",
					children: label
				}), aside]
			}),
			children,
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: `${id}-err`,
				className: "animate-in fade-in-0 slide-in-from-top-1 text-xs font-medium text-destructive",
				children: error
			})
		]
	});
}
function TextInput({ icon, error, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...props,
			"aria-invalid": !!error,
			"aria-describedby": error ? `${props.id}-err` : void 0,
			className: inputCls
		})]
	});
}
function PasswordInput({ id, value, onChange, error, disabled, visible, onToggle, onFocusChange, placeholder, autoComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "4",
						y: "11",
						width: "16",
						height: "10",
						rx: "2"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 11V7a4 4 0 0 1 8 0v4" })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				type: visible ? "text" : "password",
				value,
				disabled,
				placeholder,
				autoComplete,
				onChange: (e) => onChange(e.target.value),
				onFocus: () => onFocusChange(true),
				onBlur: () => onFocusChange(false),
				"aria-invalid": !!error,
				"aria-describedby": error ? `${id}-err` : void 0,
				className: `${inputCls} pr-12`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onToggle,
				"aria-label": visible ? "Hide password" : "Show password",
				"aria-pressed": visible,
				className: "absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				children: visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 18 })
			})
		]
	});
}
function PrimaryButton({ loading, success, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "submit",
		disabled: loading || success,
		className: "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground shadow-[var(--shadow-button)] transition hover:brightness-105 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-80",
		children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			size: 18,
			className: "animate-spin"
		}) : success ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 18 }) : null, success ? "Welcome to MarketHub" : children]
	});
}
var emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
var fakeAuth = () => new Promise((r) => setTimeout(r, 1300));
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
function nameForEmail(email) {
	const e = email.trim().toLowerCase();
	const customer = customers.find((c) => c.email.toLowerCase() === e);
	if (customer) return customer.name;
	const vendor = vendors.find((v) => v.email.toLowerCase() === e);
	if (vendor) return vendor.owner;
	return (e.split("@")[0] ?? "").replace(/[._-]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase()) || "Shopper";
}
var ROLES = [{
	value: "customer",
	label: "Shopper",
	icon: User
}, {
	value: "vendor",
	label: "Seller",
	icon: Store
}];
/**
* Which workspace to drop into after signing in. MarketHub gates /vendor and
* /admin on `user.role`, so without this there is no way to reach either in a
* seeded demo that has no real identity provider behind it.
*/
function RolePicker({ value, onChange, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		disabled,
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "text-sm font-semibold text-foreground",
			children: "Sign in as"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2",
			children: ROLES.map(({ value: v, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(v),
				"aria-pressed": value === v,
				className: `flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:opacity-60 ${value === v ? "border-brand bg-brand-soft text-brand" : "border-input bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 15 }), label]
			}, v))
		})]
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-4 flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
			size: 14,
			className: "mt-0.5 shrink-0 text-info"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Demo sign-in. No password is checked and the session lives only in this browser, so role gates here are navigation, not security." })]
	});
}
/** Shared by all three entry points: write the session, then land somewhere useful. */
function useSignIn(redirect) {
	const { login } = useStore();
	const navigate = useNavigate();
	return (user) => {
		login(user);
		const fallback = user.role === "vendor" ? "/vendor" : user.role === "admin" ? "/admin" : "/";
		const to = postLoginPath() === "/onboarding" ? "/onboarding" : redirect || fallback;
		setTimeout(() => navigate({
			to,
			replace: true
		}), 600);
	};
}
function LoginForm({ passwordVisible, onToggleVisible, onPasswordFocus, redirect }) {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("customer");
	const [remember, setRemember] = (0, import_react.useState)(true);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const signIn = useSignIn(redirect);
	const submit = async (e) => {
		e.preventDefault();
		if (loading || success) return;
		const errs = {};
		if (!email) errs.email = "Please enter your email.";
		else if (!emailOk(email)) errs.email = "That email doesn't look right.";
		if (!password) errs.password = "Please enter your password.";
		setErrors(errs);
		if (Object.keys(errs).length) return;
		setLoading(true);
		await fakeAuth();
		setLoading(false);
		setSuccess(true);
		signIn({
			name: nameForEmail(email),
			email: email.trim(),
			role
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		noValidate: true,
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "email",
				label: "Email",
				error: errors.email,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: "email",
					type: "email",
					autoComplete: "email",
					placeholder: "you@example.com",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 18 }),
					value: email,
					onChange: (e) => setEmail(e.target.value),
					error: errors.email,
					disabled: loading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "password",
				label: "Password",
				error: errors.password,
				aside: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "text-xs font-semibold text-brand hover:underline",
					children: "Forgot password?"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "password",
					value: password,
					onChange: setPassword,
					error: errors.password,
					disabled: loading,
					visible: passwordVisible,
					onToggle: onToggleVisible,
					onFocusChange: onPasswordFocus,
					placeholder: "Your password",
					autoComplete: "current-password"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RolePicker, {
				value: role,
				onChange: setRole,
				disabled: loading || success
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: remember,
					onChange: (e) => setRemember(e.target.checked),
					className: "h-4 w-4 rounded accent-[var(--brand)]"
				}), "Remember me for 30 days"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
				loading,
				success,
				children: "Log in"
			})
		]
	});
}
function SignupForm({ passwordVisible, onToggleVisible, onPasswordFocus, redirect }) {
	const [v, setV] = (0, import_react.useState)({
		name: "",
		email: "",
		password: "",
		confirm: ""
	});
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const signIn = useSignIn(redirect);
	const set = (k) => (val) => setV((s) => ({
		...s,
		[k]: val
	}));
	const submit = async (e) => {
		e.preventDefault();
		if (loading || success) return;
		const errs = {};
		if (!v.name.trim()) errs.name = "Tell us your name.";
		if (!v.email) errs.email = "Please enter your email.";
		else if (!emailOk(v.email)) errs.email = "That email doesn't look right.";
		if (!v.password) errs.password = "Choose a password.";
		else if (v.password.length < 8 || !/\d/.test(v.password) || !/[A-Za-z]/.test(v.password)) errs.password = "Use 8+ characters with letters and a number.";
		if (!v.confirm) errs.confirm = "Please confirm your password.";
		else if (v.confirm !== v.password) errs.confirm = "Passwords don't match.";
		if (!accepted) errs.accepted = "Please accept the terms to continue.";
		setErrors(errs);
		if (Object.keys(errs).length) return;
		setLoading(true);
		await fakeAuth();
		setLoading(false);
		setSuccess(true);
		signIn({
			name: v.name.trim(),
			email: v.email.trim(),
			role: "customer"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		noValidate: true,
		onSubmit: submit,
		className: "space-y-3.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "name",
				label: "Full name",
				error: errors.name,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: "name",
					autoComplete: "name",
					placeholder: "Ada Lovelace",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 18 }),
					value: v.name,
					onChange: (e) => set("name")(e.target.value),
					error: errors.name,
					disabled: loading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "su-email",
				label: "Email",
				error: errors.email,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					id: "su-email",
					type: "email",
					autoComplete: "email",
					placeholder: "you@example.com",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 18 }),
					value: v.email,
					onChange: (e) => set("email")(e.target.value),
					error: errors.email,
					disabled: loading
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "su-password",
				label: "Password",
				error: errors.password,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "su-password",
					value: v.password,
					onChange: set("password"),
					error: errors.password,
					disabled: loading,
					visible: passwordVisible,
					onToggle: onToggleVisible,
					onFocusChange: onPasswordFocus,
					placeholder: "8+ characters",
					autoComplete: "new-password"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				id: "su-confirm",
				label: "Confirm password",
				error: errors.confirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
					id: "su-confirm",
					value: v.confirm,
					onChange: set("confirm"),
					error: errors.confirm,
					disabled: loading,
					visible: passwordVisible,
					onToggle: onToggleVisible,
					onFocusChange: onPasswordFocus,
					placeholder: "Repeat password",
					autoComplete: "new-password"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 pt-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex cursor-pointer select-none items-start gap-2.5 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: accepted,
						onChange: (e) => setAccepted(e.target.checked),
						disabled: loading,
						className: "mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--brand)]"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"I agree to the ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "font-semibold text-brand hover:underline",
							children: "Terms"
						}),
						" and",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "font-semibold text-brand hover:underline",
							children: "Privacy Policy"
						}),
						"."
					] })]
				}), errors.accepted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-destructive",
					children: errors.accepted
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pt-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
					loading,
					success,
					children: "Create account"
				})
			})
		]
	});
}
function SocialLogin({ redirect, disabled }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const signIn = useSignIn(redirect);
	const go = async () => {
		if (busy || disabled) return;
		setBusy(true);
		await fakeAuth();
		signIn({
			name: "Google Guest",
			email: "guest@gmail.com",
			role: "customer"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
				"or",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: go,
			disabled: busy || disabled,
			className: "flex h-12 w-full items-center justify-center gap-3 rounded-xl border bg-card font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70",
			children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				size: 18,
				className: "animate-spin"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 48 48",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						fill: "#FFC107",
						d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						fill: "#FF3D00",
						d: "m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						fill: "#4CAF50",
						d: "M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						fill: "#1976D2",
						d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
					})
				]
			}), busy ? "Signing you in" : "Continue with Google"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-center text-xs text-muted-foreground",
			children: "Simulated for this demo — no Google account is contacted."
		})
	] });
}
function AuthPanel(props) {
	const { mode, onModeChange, redirect = "", ...pw } = props;
	const login = mode === "login";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full flex-col justify-center px-6 py-10 sm:px-12 lg:px-14",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mb-8 flex w-fit items-center gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { size: 18 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-lg font-bold tracking-tight",
					children: "MarketHub"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-swap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-bold tracking-tight sm:text-4xl",
						children: login ? "Welcome back!" : "Join the market"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-7 mt-2 text-muted-foreground",
						children: login ? "Sign in to continue to MarketHub." : "Create an account to start shopping smarter."
					}),
					login ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {
						...pw,
						redirect
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignupForm, {
						...pw,
						redirect
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialLogin, {
						redirect,
						disabled: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DemoAuthNotice, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-center text-sm text-muted-foreground",
						children: [login ? "Don't have an account? " : "Already have an account? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onModeChange(login ? "signup" : "login"),
							className: "rounded font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							children: login ? "Sign up" : "Log in"
						})]
					})
				]
			}, mode)]
		})
	});
}
/** Offsets the whole face when a character looks away. Custom props need the cast — see ui/sidebar.tsx. */
var facePose = (x, y) => ({
	"--away-x": x,
	"--away-y": y
});
/** Single eye. Pupil position is driven imperatively by the scene's rAF loop via data attributes. */
function Eye$1({ cx, cy, r, range, away, delay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		className: "eye-blink",
		style: { animationDelay: `${delay}s` },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			className: "eye-lid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r,
				fill: "var(--mob-eye)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				"data-pupil": true,
				"data-range": range,
				"data-away": away.join(","),
				cx,
				cy,
				r: r * .48,
				fill: "var(--mob-pupil)"
			})]
		})
	});
}
function CharacterScene({ state }) {
	const rootRef = (0, import_react.useRef)(null);
	const stateRef = (0, import_react.useRef)(state);
	stateRef.current = state;
	(0, import_react.useEffect)(() => {
		const root = rootRef.current;
		if (!root) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const pupils = Array.from(root.querySelectorAll("[data-pupil]"));
		const cur = pupils.map(() => ({
			x: 0,
			y: 0
		}));
		const mouse = {
			x: 0,
			y: 0,
			active: false
		};
		let raf = 0;
		let idleT = 0;
		const onMove = (e) => {
			mouse.x = e.clientX;
			mouse.y = e.clientY;
			mouse.active = true;
		};
		const onLeave = () => mouse.active = false;
		window.addEventListener("pointermove", onMove, { passive: true });
		document.addEventListener("pointerleave", onLeave);
		const tick = (t) => {
			const s = stateRef.current;
			idleT = t / 1e3;
			pupils.forEach((p, i) => {
				const c = cur[i];
				const range = Number(p.dataset["range"]);
				let tx = 0;
				let ty = 0;
				if (s === "lookingAway" || s === "eyesClosed") {
					const [ax, ay] = (p.dataset["away"] ?? "0,0").split(",").map(Number);
					tx = ax * range;
					ty = ay * range;
				} else if (mouse.active && !reduce) {
					const b = p.getBoundingClientRect();
					const dx = mouse.x - (b.left + b.width / 2);
					const dy = mouse.y - (b.top + b.height / 2);
					const dist = Math.hypot(dx, dy) || 1;
					const k = Math.min(1, dist / 260);
					tx = dx / dist * range * k;
					ty = dy / dist * range * k;
				} else if (!reduce) {
					tx = Math.sin(idleT * .5 + (i >> 1)) * range * .35;
					ty = Math.cos(idleT * .4 + (i >> 1)) * range * .2;
				}
				const ease = reduce ? 1 : .12 + i % 3 * .02;
				c.x += (tx - c.x) * ease;
				c.y += (ty - c.y) * ease;
				p.setAttribute("transform", `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)})`);
			});
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerleave", onLeave);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: rootRef,
		"data-mood": state,
		className: "relative h-full w-full",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 400 380",
			className: "h-full w-full overflow-visible",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "305",
					cy: "78",
					r: "26",
					fill: "var(--mob-sun)",
					opacity: "0.55"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M30 150 q20 -18 40 0 q20 -18 40 0",
					stroke: "var(--mob-ink)",
					strokeOpacity: ".15",
					strokeWidth: "3",
					fill: "none",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "205",
					cy: "352",
					rx: "175",
					ry: "12",
					fill: "var(--mob-ink)",
					opacity: "0.08"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "mob",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "62",
							y: "70",
							width: "112",
							height: "282",
							rx: "56",
							fill: "var(--mob-coral)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "mob-face",
							style: facePose("-8px", "-6px"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
									cx: 98,
									cy: 130,
									r: 13,
									range: 5,
									away: [-1, -.6],
									delay: .4
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
									cx: 138,
									cy: 130,
									r: 13,
									range: 5,
									away: [-1, -.6],
									delay: .45
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									className: "mob-blush",
									cx: "88",
									cy: "156",
									rx: "8",
									ry: "4",
									fill: "var(--mob-blush)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									className: "mob-blush",
									cx: "148",
									cy: "156",
									rx: "8",
									ry: "4",
									fill: "var(--mob-blush)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									className: "mouth-smile",
									d: "M108 160 q10 9 20 0",
									stroke: "var(--mob-pupil)",
									strokeWidth: "3.5",
									fill: "none",
									strokeLinecap: "round"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									className: "mouth-open",
									cx: "118",
									cy: "164",
									r: "5",
									fill: "var(--mob-pupil)"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M66 220 q-30 20 -22 56",
							stroke: "var(--mob-coral)",
							strokeWidth: "10",
							fill: "none",
							strokeLinecap: "round"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "mob mob-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "160",
						y: "150",
						width: "96",
						height: "202",
						rx: "40",
						fill: "var(--mob-ink)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: "mob-face",
						style: facePose("6px", "-8px"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
								cx: 192,
								cy: 196,
								r: 11,
								range: 4,
								away: [.3, -1],
								delay: 2.1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
								cx: 226,
								cy: 196,
								r: 11,
								range: 4,
								away: [.3, -1],
								delay: 2.15
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								className: "mob-blush",
								cx: "184",
								cy: "220",
								rx: "7",
								ry: "3.5",
								fill: "var(--mob-blush)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								className: "mob-blush",
								cx: "234",
								cy: "220",
								rx: "7",
								ry: "3.5",
								fill: "var(--mob-blush)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								className: "mouth-smile",
								d: "M201 222 h16",
								stroke: "var(--mob-eye)",
								strokeWidth: "3.5",
								strokeLinecap: "round"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								className: "mouth-open",
								cx: "209",
								cy: "224",
								r: "4.5",
								fill: "var(--mob-eye)"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "mob mob-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M228 352 v-50 a75 75 0 0 1 150 0 v50 z",
						fill: "var(--mob-mint)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: "mob-face",
						style: facePose("10px", "2px"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
								cx: 286,
								cy: 278,
								r: 14,
								range: 6,
								away: [1, .2],
								delay: 3.7
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
								cx: 328,
								cy: 278,
								r: 14,
								range: 6,
								away: [1, .2],
								delay: 3.74
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								className: "mob-blush",
								cx: "274",
								cy: "305",
								rx: "8",
								ry: "4",
								fill: "var(--mob-blush)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
								className: "mob-blush",
								cx: "340",
								cy: "305",
								rx: "8",
								ry: "4",
								fill: "var(--mob-blush)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								className: "mouth-smile",
								d: "M296 306 q11 10 22 0",
								stroke: "var(--mob-pupil)",
								strokeWidth: "3.5",
								fill: "none",
								strokeLinecap: "round"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								className: "mouth-open",
								cx: "307",
								cy: "310",
								r: "5",
								fill: "var(--mob-pupil)"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "mob mob-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: "150",
							y1: "262",
							x2: "142",
							y2: "238",
							stroke: "var(--mob-ink)",
							strokeWidth: "3",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "141",
							cy: "235",
							r: "5",
							fill: "var(--mob-coral)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M100 352 v-30 a50 50 0 0 1 100 0 v30 z",
							fill: "var(--mob-sun)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "mob-face",
							style: facePose("-4px", "-8px"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
									cx: 134,
									cy: 302,
									r: 10,
									range: 4,
									away: [-.5, -1],
									delay: 1.2
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye$1, {
									cx: 166,
									cy: 302,
									r: 10,
									range: 4,
									away: [-.5, -1],
									delay: 1.24
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									className: "mob-blush",
									cx: "124",
									cy: "322",
									rx: "6",
									ry: "3",
									fill: "var(--mob-blush)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
									className: "mob-blush",
									cx: "176",
									cy: "322",
									rx: "6",
									ry: "3",
									fill: "var(--mob-blush)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									className: "mouth-smile",
									d: "M144 322 q6 6 12 0",
									stroke: "var(--mob-pupil)",
									strokeWidth: "3",
									fill: "none",
									strokeLinecap: "round"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									className: "mouth-open",
									cx: "150",
									cy: "325",
									r: "4",
									fill: "var(--mob-pupil)"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M196 330 q14 4 16 14",
							stroke: "var(--mob-sun)",
							strokeWidth: "8",
							fill: "none",
							strokeLinecap: "round"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: "204",
							y: "336",
							width: "26",
							height: "22",
							rx: "4",
							fill: "var(--mob-eye)",
							stroke: "var(--mob-ink)",
							strokeWidth: "2.5"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M211 337 v-5 a6 6 0 0 1 12 0 v5",
							stroke: "var(--mob-ink)",
							strokeWidth: "2.5",
							fill: "none"
						})
					]
				})
			]
		})
	});
}
/**
* Only same-site absolute paths are accepted as a post-login destination.
*
* `redirect` arrives in the URL, so it is attacker-controlled: a link like
* /login?redirect=https://evil.example would otherwise turn MarketHub's own
* sign-in page into a credible phishing hop. Anything that is not a single-slash
* absolute path is dropped, which also rejects protocol-relative `//host` and
* `/\host` forms that some browsers normalise to an external origin.
*/
/**
* Fills the stage area behind the auth card with the site's own palette, blurred.
* Sits at -z-10 inside an `isolate` parent, so it covers the dark `bg-stage`
* without affecting the card or the scene panel. Decorative, so aria-hidden.
*/
function StageBackdrop() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hero_default,
				alt: "",
				className: "absolute inset-0 h-full w-full scale-110 object-cover opacity-75 blur-[70px]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-32 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand/45 blur-[120px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-28 top-1/4 h-[30rem] w-[30rem] rounded-full bg-warning/40 blur-[120px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-36 left-1/4 h-[32rem] w-[32rem] rounded-full bg-success/30 blur-[120px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-28 -right-28 h-[28rem] w-[28rem] rounded-full bg-brand-soft/45 blur-[120px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-surface/25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: "radial-gradient(ellipse at center, transparent 30%, color-mix(in oklab, var(--stage) 55%, transparent) 115%)" }
			})
		]
	});
}
function AuthPage() {
	const search = Route$12.useSearch();
	const [mode, setMode] = (0, import_react.useState)(search.mode ?? "login");
	const [passwordFocused, setPasswordFocused] = (0, import_react.useState)(false);
	const [passwordVisible, setPasswordVisible] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative isolate flex min-h-screen items-center justify-center bg-stage p-3 sm:p-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageBackdrop, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid w-full max-w-[1060px] overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-auth)] md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative flex h-64 items-end justify-center overflow-hidden bg-scene px-6 pt-6 sm:h-80 md:h-auto md:min-h-[640px] md:p-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "absolute left-6 top-6 hidden font-display text-sm font-semibold text-muted-foreground md:block md:left-10 md:top-10",
					children: [
						"Your neighbourhood of shops,",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"all in one place."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full w-full max-w-[460px] md:h-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterScene, { state: passwordVisible ? "eyesClosed" : passwordFocused ? "lookingAway" : "tracking" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPanel, {
				mode,
				onModeChange: (m) => {
					setMode(m);
					setPasswordFocused(false);
					setPasswordVisible(false);
				},
				passwordVisible,
				onToggleVisible: () => setPasswordVisible((v) => !v),
				onPasswordFocus: setPasswordFocused,
				redirect: search.redirect ?? ""
			}) })]
		})]
	});
}
//#endregion
export { AuthPage as component };
