import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { StoreLayout } from "./StoreLayout";

/**
 * Wraps the signed-in pages — /account, /orders, /notifications, /checkout.
 *
 * Two things matter here. First, nothing renders until the session has been
 * resolved: `hydrated` now means "the server has told us who you are", so
 * rendering the signed-out state first would flash "please sign in" at a
 * signed-in visitor on every load. Second, the sign-in link carries the current
 * path as `redirect` so the visitor lands back where they were aiming (the
 * /login route validates that value is a same-site path before using it).
 *
 * This is still only a navigation guard, and that is fine, because it is no
 * longer the thing standing between a visitor and the data. Every endpoint
 * behind these pages calls `requireUser()` server-side and filters by the
 * session's user id, so hiding or showing this component changes what is
 * painted, never what can be read. Removing it from devtools reveals an empty
 * shell, not somebody else's orders.
 */
export function RequireAuth({
  title = "Sign in to continue",
  body = "Your account, orders and saved items live behind a quick sign-in.",
  children,
}: {
  title?: string;
  body?: string;
  children: ReactNode;
}) {
  const { user, hydrated } = useStore();
  const path = useRouterState({ select: (s) => s.location.href });

  if (!hydrated) {
    return (
      <StoreLayout>
        <div className="container-mh grid min-h-[50vh] place-items-center" aria-busy="true">
          <span className="sr-only">Loading your account</span>
        </div>
      </StoreLayout>
    );
  }

  if (!user) {
    return (
      <StoreLayout>
        <div className="container-mh pt-16">
          <div className="card-mh mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/login" search={{ redirect: path }}>Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login" search={{ redirect: path, mode: "signup" }}>Create account</Link>
              </Button>
            </div>
            <Link to="/shop" className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Keep browsing instead
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return <StoreLayout>{children}</StoreLayout>;
}
