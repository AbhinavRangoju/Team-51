//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-store-BRs06JfO.js
var KEY = "markethub.onboarding";
var initial = {
	onboardingCompleted: false,
	selectedRole: null,
	onboardingStep: 0,
	customerPreferences: [],
	vendorSetupStatus: "none"
};
function loadOnboarding() {
	if (typeof window === "undefined") return initial;
	try {
		const raw = window.localStorage.getItem(KEY);
		return raw ? {
			...initial,
			...JSON.parse(raw)
		} : initial;
	} catch {
		return initial;
	}
}
function saveOnboarding(patch) {
	const next = {
		...loadOnboarding(),
		...patch
	};
	try {
		window.localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
	return next;
}
var roleHome = (role) => role === "vendor" ? "/vendor" : "/shop";
/** Where to send a user right after a successful sign-in. */
function postLoginPath() {
	const s = loadOnboarding();
	return s.onboardingCompleted ? roleHome(s.selectedRole) : "/onboarding";
}
//#endregion
export { loadOnboarding, postLoginPath, roleHome, saveOnboarding };
