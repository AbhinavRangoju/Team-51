import { Link } from "@tanstack/react-router";
import { FileText, Info } from "lucide-react";
import type { ReactNode } from "react";

import { LEGAL_PAGES } from "@/lib/legal";
import { StoreLayout } from "./StoreLayout";

export type LegalSection = { id: string; heading: string; body: ReactNode };

/** Shared prose styles — there is no typography plugin in this project. */
export const prose = "space-y-3 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground";
export const bullets = "ml-5 list-disc space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground";

function SiblingLinks({ current }: { current: string }) {
  return (
    <nav aria-label="Other policies" className="space-y-1.5">
      {LEGAL_PAGES.filter((p) => p.to !== current).map((p) => (
        <Link
          key={p.to}
          to={p.to}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground"
        >
          <FileText className="h-4 w-4 shrink-0" />
          {p.label}
        </Link>
      ))}
    </nav>
  );
}

export function LegalPage({
  title,
  summary,
  updated,
  current,
  sections,
}: {
  title: string;
  summary: string;
  updated: string;
  current: string;
  sections: LegalSection[];
}) {
  return (
    <StoreLayout>
      <div className="container-mh pt-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">{title}</span>
        </nav>

        <header className="mt-4 max-w-3xl">
          <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{summary}</p>
          <p className="mt-4 text-xs text-muted-foreground">Last updated {updated}</p>
        </header>

        {/*
          Stated plainly at the top of every policy. MarketHub is a hackathon
          build, not a trading company: there is no registered entity behind
          these documents and no real orders, payments or personal data flowing
          through them. Presenting them as enforceable terms would be the
          dishonest option.
        */}
        <div className="card-mh mt-7 flex max-w-3xl items-start gap-3 border-info/40 bg-info-soft/30 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <p className="text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">This is a demonstration document.</strong>{" "}
            MarketHub is a project build, not a registered business. These pages describe how the
            product is designed to behave and are written to match what the application actually
            does — they are not legal advice and create no binding obligation.
          </p>
        </div>

        <div className="mt-10 grid gap-10 pb-10 lg:grid-cols-[1fr_260px]">
          <article className="max-w-3xl space-y-10">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="mb-3 text-xl font-semibold">{s.heading}</h2>
                {s.body}
              </section>
            ))}
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="card-mh p-5">
              <h2 className="mb-3 text-sm font-semibold">On this page</h2>
              <nav aria-label="Sections" className="space-y-1.5">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground"
                  >
                    {s.heading}
                  </a>
                ))}
              </nav>
            </div>
            <div className="card-mh p-5">
              <h2 className="mb-3 text-sm font-semibold">Other policies</h2>
              <SiblingLinks current={current} />
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
