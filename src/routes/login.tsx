import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthPanel, type AuthMode } from "@/components/auth/AuthPanel";
import { CharacterScene, type CharacterState } from "@/components/auth/CharacterScene";
import hero from "@/assets/hero.jpg";

type Search = { redirect?: string; mode?: AuthMode };

/**
 * Only same-site absolute paths are accepted as a post-login destination.
 *
 * `redirect` arrives in the URL, so it is attacker-controlled: a link like
 * /login?redirect=https://evil.example would otherwise turn MarketHub's own
 * sign-in page into a credible phishing hop. Anything that is not a single-slash
 * absolute path is dropped, which also rejects protocol-relative `//host` and
 * `/\host` forms that some browsers normalise to an external origin.
 */
function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: safeRedirect(s.redirect),
    mode: s.mode === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — MarketHub" },
      { name: "description", content: "Log in or create your MarketHub account to shop, save favorites and track orders." },
      { property: "og:title", content: "Sign in — MarketHub" },
      { property: "og:description", content: "Log in or create your MarketHub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

/**
 * Fills the stage area behind the auth card with the site's own palette, blurred.
 * Sits at -z-10 inside an `isolate` parent, so it covers the dark `bg-stage`
 * without affecting the card or the scene panel. Decorative, so aria-hidden.
 */
function StageBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* the same storefront photograph the homepage hero uses, blurred past recognition */}
      <img
        src={hero}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-75 blur-[70px]"
      />
      {/* colour washes taken straight from the theme tokens */}
      <div className="absolute -left-32 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand/45 blur-[120px]" />
      <div className="absolute -right-28 top-1/4 h-[30rem] w-[30rem] rounded-full bg-warning/40 blur-[120px]" />
      <div className="absolute -bottom-36 left-1/4 h-[32rem] w-[32rem] rounded-full bg-success/30 blur-[120px]" />
      <div className="absolute -bottom-28 -right-28 h-[28rem] w-[28rem] rounded-full bg-brand-soft/45 blur-[120px]" />
      {/* warm scrim so the stage reads as the site palette, not as a photograph */}
      <div className="absolute inset-0 bg-surface/25" />
      {/* soft vignette: keeps the card's white edge defined against the wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, color-mix(in oklab, var(--stage) 55%, transparent) 115%)",
        }}
      />
    </div>
  );
}

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<AuthMode>(search.mode ?? "login");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Priority: visible > focused > tracking
  const characterState: CharacterState = passwordVisible ? "eyesClosed" : passwordFocused ? "lookingAway" : "tracking";

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center bg-stage p-3 sm:p-8">
      <StageBackdrop />
      <div className="grid w-full max-w-[1060px] overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-auth)] md:grid-cols-2">
        <section className="relative flex h-64 items-end justify-center overflow-hidden bg-scene px-6 pt-6 sm:h-80 md:h-auto md:min-h-[640px] md:p-10">
          <p className="absolute left-6 top-6 hidden font-display text-sm font-semibold text-muted-foreground md:block md:left-10 md:top-10">
            Your neighbourhood of shops,<br />all in one place.
          </p>
          <div className="h-full w-full max-w-[460px] md:h-auto">
            <CharacterScene state={characterState} />
          </div>
        </section>

        <section>
          <AuthPanel
            mode={mode}
            onModeChange={(m) => { setMode(m); setPasswordFocused(false); setPasswordVisible(false); }}
            passwordVisible={passwordVisible}
            onToggleVisible={() => setPasswordVisible((v) => !v)}
            onPasswordFocus={setPasswordFocused}
            redirect={search.redirect ?? ""}
          />
        </section>
      </div>
    </main>
  );
}
