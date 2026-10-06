import { useEffect, useRef, type CSSProperties } from "react";

export type CharacterState = "idle" | "tracking" | "lookingAway" | "eyesClosed";

type EyeProps = { cx: number; cy: number; r: number; range: number; away: [number, number]; delay: number };

/** Offsets the whole face when a character looks away. Custom props need the cast — see ui/sidebar.tsx. */
const facePose = (x: string, y: string) => ({ "--away-x": x, "--away-y": y }) as CSSProperties;

/** Single eye. Pupil position is driven imperatively by the scene's rAF loop via data attributes. */
function Eye({ cx, cy, r, range, away, delay }: EyeProps) {
  return (
    <g className="eye-blink" style={{ animationDelay: `${delay}s` }}>
      <g className="eye-lid">
        <circle cx={cx} cy={cy} r={r} fill="var(--mob-eye)" />
        <circle
          data-pupil
          data-range={range}
          data-away={away.join(",")}
          cx={cx}
          cy={cy}
          r={r * 0.48}
          fill="var(--mob-pupil)"
        />
      </g>
    </g>
  );
}

export function CharacterScene({ state }: { state: CharacterState }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pupils = Array.from(root.querySelectorAll<SVGCircleElement>("[data-pupil]"));
    const cur = pupils.map(() => ({ x: 0, y: 0 }));
    const mouse = { x: 0, y: 0, active: false };
    let raf = 0;
    let idleT = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const tick = (t: number) => {
      const s = stateRef.current;
      idleT = t / 1000;

      pupils.forEach((p, i) => {
        const c = cur[i]!;
        const range = Number(p.dataset["range"]);
        let tx = 0;
        let ty = 0;

        if (s === "lookingAway" || s === "eyesClosed") {
          const [ax, ay] = (p.dataset["away"] ?? "0,0").split(",").map(Number) as [number, number];
          tx = ax * range;
          ty = ay * range;
        } else if (mouse.active && !reduce) {
          const b = p.getBoundingClientRect();
          const dx = mouse.x - (b.left + b.width / 2);
          const dy = mouse.y - (b.top + b.height / 2);
          const dist = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, dist / 260);
          tx = (dx / dist) * range * k;
          ty = (dy / dist) * range * k;
        } else if (!reduce) {
          // gentle idle wander, offset per eye pair
          tx = Math.sin(idleT * 0.5 + (i >> 1)) * range * 0.35;
          ty = Math.cos(idleT * 0.4 + (i >> 1)) * range * 0.2;
        }

        const ease = reduce ? 1 : 0.12 + (i % 3) * 0.02;
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

  return (
    <div ref={rootRef} data-mood={state} className="relative h-full w-full" aria-hidden="true">
      <svg viewBox="0 0 400 380" className="h-full w-full overflow-visible">
        {/* environment */}
        <circle cx="305" cy="78" r="26" fill="var(--mob-sun)" opacity="0.55" />
        <path d="M30 150 q20 -18 40 0 q20 -18 40 0" stroke="var(--mob-ink)" strokeOpacity=".15" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="205" cy="352" rx="175" ry="12" fill="var(--mob-ink)" opacity="0.08" />

        {/* 1. tall coral */}
        <g className="mob">
          <rect x="62" y="70" width="112" height="282" rx="56" fill="var(--mob-coral)" />
          <g className="mob-face" style={facePose("-8px", "-6px")}>
            <Eye cx={98} cy={130} r={13} range={5} away={[-1, -0.6]} delay={0.4} />
            <Eye cx={138} cy={130} r={13} range={5} away={[-1, -0.6]} delay={0.45} />
            <ellipse className="mob-blush" cx="88" cy="156" rx="8" ry="4" fill="var(--mob-blush)" />
            <ellipse className="mob-blush" cx="148" cy="156" rx="8" ry="4" fill="var(--mob-blush)" />
            <path className="mouth-smile" d="M108 160 q10 9 20 0" stroke="var(--mob-pupil)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle className="mouth-open" cx="118" cy="164" r="5" fill="var(--mob-pupil)" />
          </g>
          <path d="M66 220 q-30 20 -22 56" stroke="var(--mob-coral)" strokeWidth="10" fill="none" strokeLinecap="round" />
        </g>

        {/* 2. ink pill */}
        <g className="mob mob-2">
          <rect x="160" y="150" width="96" height="202" rx="40" fill="var(--mob-ink)" />
          <g className="mob-face" style={facePose("6px", "-8px")}>
            <Eye cx={192} cy={196} r={11} range={4} away={[0.3, -1]} delay={2.1} />
            <Eye cx={226} cy={196} r={11} range={4} away={[0.3, -1]} delay={2.15} />
            <ellipse className="mob-blush" cx="184" cy="220" rx="7" ry="3.5" fill="var(--mob-blush)" />
            <ellipse className="mob-blush" cx="234" cy="220" rx="7" ry="3.5" fill="var(--mob-blush)" />
            <path className="mouth-smile" d="M201 222 h16" stroke="var(--mob-eye)" strokeWidth="3.5" strokeLinecap="round" />
            <circle className="mouth-open" cx="209" cy="224" r="4.5" fill="var(--mob-eye)" />
          </g>
        </g>

        {/* 3. mint dome */}
        <g className="mob mob-3">
          <path d="M228 352 v-50 a75 75 0 0 1 150 0 v50 z" fill="var(--mob-mint)" />
          <g className="mob-face" style={facePose("10px", "2px")}>
            <Eye cx={286} cy={278} r={14} range={6} away={[1, 0.2]} delay={3.7} />
            <Eye cx={328} cy={278} r={14} range={6} away={[1, 0.2]} delay={3.74} />
            <ellipse className="mob-blush" cx="274" cy="305" rx="8" ry="4" fill="var(--mob-blush)" />
            <ellipse className="mob-blush" cx="340" cy="305" rx="8" ry="4" fill="var(--mob-blush)" />
            <path className="mouth-smile" d="M296 306 q11 10 22 0" stroke="var(--mob-pupil)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle className="mouth-open" cx="307" cy="310" r="5" fill="var(--mob-pupil)" />
          </g>
        </g>

        {/* 4. small sun with antenna, holding a bag */}
        <g className="mob mob-4">
          <line x1="150" y1="262" x2="142" y2="238" stroke="var(--mob-ink)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="141" cy="235" r="5" fill="var(--mob-coral)" />
          <path d="M100 352 v-30 a50 50 0 0 1 100 0 v30 z" fill="var(--mob-sun)" />
          <g className="mob-face" style={facePose("-4px", "-8px")}>
            <Eye cx={134} cy={302} r={10} range={4} away={[-0.5, -1]} delay={1.2} />
            <Eye cx={166} cy={302} r={10} range={4} away={[-0.5, -1]} delay={1.24} />
            <ellipse className="mob-blush" cx="124" cy="322" rx="6" ry="3" fill="var(--mob-blush)" />
            <ellipse className="mob-blush" cx="176" cy="322" rx="6" ry="3" fill="var(--mob-blush)" />
            <path className="mouth-smile" d="M144 322 q6 6 12 0" stroke="var(--mob-pupil)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle className="mouth-open" cx="150" cy="325" r="4" fill="var(--mob-pupil)" />
          </g>
          <path d="M196 330 q14 4 16 14" stroke="var(--mob-sun)" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="204" y="336" width="26" height="22" rx="4" fill="var(--mob-eye)" stroke="var(--mob-ink)" strokeWidth="2.5" />
          <path d="M211 337 v-5 a6 6 0 0 1 12 0 v5" stroke="var(--mob-ink)" strokeWidth="2.5" fill="none" />
        </g>
      </svg>
    </div>
  );
}
