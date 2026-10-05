import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { StoreLayout } from "./StoreLayout";

/**
 * Wraps the signed-in customer pages — /account, /orders, /notifications.
 *
 * Two things matter here. First, nothing renders until the store has hydrated
 * from localStorage: the server has no session, so rendering the signed-out
 * state first would flash "please sign in" at a signed-in visitor on every
 * load. Second, the sign-in link carries the current path as `redirect` so the
 * visitor lands back where they were aiming (the /login route validates that
 * value is a same-site path before using it).
 *
 * This is a navigation guard, not an access control. The session is a
 * localStorage object with no server-side verification, so it keeps honest
 * users on a sensible path and nothing more. Real enforcement would have to sit
 * on whatever API eventually serves this data.
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
