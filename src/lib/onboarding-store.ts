// Frontend-only onboarding state. The backend must remain the source of truth for roles
// once one exists — this only remembers UI progress on this device.

export type Role = "customer" | "vendor";
export type VendorSetupStatus = "none" | "in_progress" | "submitted";

export type OnboardingState = {
  onboardingCompleted: boolean;
  selectedRole: Role | null;
  onboardingStep: number;
  customerPreferences: string[];
  vendorSetupStatus: VendorSetupStatus;
};

const KEY = "markethub.onboarding";

const initial: OnboardingState = {
  onboardingCompleted: false,
  selectedRole: null,
  onboardingStep: 0,
  customerPreferences: [],
  vendorSetupStatus: "none",
};

export function loadOnboarding(): OnboardingState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...initial, ...(JSON.parse(raw) as Partial<OnboardingState>) } : initial;
  } catch {
    return initial;
  }
}

export function saveOnboarding(patch: Partial<OnboardingState>): OnboardingState {
  const next = { ...loadOnboarding(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function resetOnboarding() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const roleHome = (role: Role | null) => (role === "vendor" ? "/vendor" : "/shop");

/** Where to send a user right after a successful sign-in. */
export function postLoginPath(): "/onboarding" | "/shop" | "/vendor" {
  const s = loadOnboarding();
  return s.onboardingCompleted ? roleHome(s.selectedRole) : "/onboarding";
}
