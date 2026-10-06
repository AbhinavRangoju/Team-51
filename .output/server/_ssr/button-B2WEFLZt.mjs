import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Slot, require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./ui-JZvfr52Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-B2WEFLZt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold cursor-pointer transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/85",
			brand: "bg-brand text-brand-foreground hover:bg-brand/90 shadow-[0_8px_24px_-10px_var(--brand)]",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-input bg-card hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground hover:bg-accent",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-5",
			sm: "h-8 px-3.5 text-xs",
			lg: "h-12 px-7 text-[15px]",
			icon: "h-10 w-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { Button };
