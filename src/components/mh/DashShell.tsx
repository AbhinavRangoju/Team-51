import { Link } from "@tanstack/react-router";
import { LogOut, Menu, ShieldAlert, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore, type Role } from "@/lib/store";
import { Logo } from "./ui";
import { Button } from "@/components/ui/button";

export type DashNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Section selector for dashboards that live on one route. */
  search?: Record<string, string>;
};

export function DashShell({ role, title, nav, children }: { role: Role; title: string; nav: DashNavItem[]; children: ReactNode }) {
  const { user, hydrated, logout } = useStore();
  const [open, setOpen] = useState(false);

  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="card-mh max-w-md p-10 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-destructive-soft text-destructive"><ShieldAlert className="h-6 w-6" /></div>
          <h1 className="text-2xl font-semibold">Restricted area</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This {role} workspace is only available to {role} accounts. Sign in with the right role to continue.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild><Link to="/login">Sign in</Link></Button>
            <Button asChild variant="outline"><Link to="/">Back to store</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const side = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
      </div>
      <div className="mx-4 mb-4 rounded-xl bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <nav className="flex-1 space-y-0.5 px-3">
        {nav.map(({ to, label, icon: Icon, exact, search }) => (
          <Link
            key={`${to}-${label}`}
            to={to}
            search={search}
            onClick={() => setOpen(false)}
            activeOptions={{ exact: !!exact, includeSearch: !!search }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground"
            activeProps={{ className: "!bg-primary !text-primary-foreground" }}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">{user.name[0]}</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"><LogOut className="h-4 w-4" /> Log out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar lg:block">{side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-64 bg-sidebar animate-in slide-in-from-left" onClick={(e) => e.stopPropagation()}>{side}</aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <span className="text-sm text-muted-foreground">{title}</span>
        <Link to="/" className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground">View storefront →</Link>
      </header>
      <main className="px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
