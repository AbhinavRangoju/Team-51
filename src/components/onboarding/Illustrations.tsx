import type { ReactNode } from "react";

export type SceneId = "discover" | "compare" | "secure" | "store" | "products" | "orders" | "analytics";

const C = {
  coral: "var(--mob-coral)",
  ink: "var(--mob-ink)",
  mint: "var(--mob-mint)",
  sun: "var(--mob-sun)",
  white: "var(--mob-eye)",
  line: "var(--border)",
  soft: "var(--accent)",
  primary: "var(--primary)",
};

/** Positions content, then floats it (CSS transform must live on an inner group). */
function Float({
  x,
  y,
  delay = 0,
  slow,
  children,
}: {
  x: number;
  y: number;
  delay?: number;
  slow?: boolean;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={slow ? "ob-float ob-float-slow" : "ob-float"} style={{ animationDelay: `${delay}s` }}>
        {children}
      </g>
    </g>
  );
}

const Shadow = ({ cx, cy, rx }: { cx: number; cy: number; rx: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.14} fill={C.ink} opacity={0.1} />
);

function Glyph({ kind, color }: { kind: "shirt" | "phone" | "lamp" | "bottle" | "watch"; color: string }) {
  switch (kind) {
    case "shirt":
      return <path d="M10 6 18 2h8l8 4 6 9-7 4-3-4v21H14V15l-3 4-7-4z" fill={color} />;
    case "phone":
      return (
        <>
          <path d="M8 26a14 14 0 0 1 28 0" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
          <rect x={4} y={24} width={10} height={14} rx={4} fill={color} />
          <rect x={30} y={24} width={10} height={14} rx={4} fill={color} />
        </>
      );
    case "lamp":
      return (
        <>
          <path d="M12 4h20l6 18H6z" fill={color} />
          <rect x={20} y={22} width={4} height={14} fill={C.ink} />
          <rect x={12} y={35} width={20} height={5} rx={2.5} fill={C.ink} />
        </>
      );
    case "bottle":
      return (
        <>
          <rect x={16} y={2} width={12} height={10} rx={3} fill={C.ink} />
          <rect x={10} y={12} width={24} height={28} rx={8} fill={color} />
        </>
      );
    case "watch":
      return (
        <>
          <rect x={16} y={0} width={12} height={42} rx={5} fill={C.ink} />
          <circle cx={22} cy={21} r={12} fill={color} />
          <circle cx={22} cy={21} r={6} fill={C.white} />
        </>
      );
  }
}

function ProductCard({ glyph, color, price }: { glyph: Parameters<typeof Glyph>[0]["kind"]; color: string; price: string }) {
  return (
    <g>
      <rect width={78} height={96} rx={16} fill={C.white} filter="url(#ob-soft)" />
      <rect x={8} y={8} width={62} height={50} rx={11} fill={C.soft} />
      <g transform="translate(17 12)">
        <Glyph kind={glyph} color={color} />
      </g>
      <rect x={10} y={66} width={40} height={5} rx={2.5} fill={C.ink} opacity={0.75} />
      <text x={10} y={86} fontSize={11} fontWeight={700} fill={C.primary} fontFamily="var(--font-display)">
        {price}
      </text>
    </g>
  );
}

const Stars = ({ n }: { n: number }) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => (
      <path
        key={i}
        transform={`translate(${i * 11} 0)`}
        d="M5 0l1.5 3.2 3.5.4-2.6 2.4.7 3.5L5 7.8 1.9 9.5l.7-3.5L0 3.6l3.5-.4z"
        fill={i < n ? C.sun : C.line}
      />
    ))}
  </g>
);

const Check = ({ s = 1, color = C.white }: { s?: number; color?: string }) => (
  <path
    transform={`scale(${s})`}
    d="M-6 0l4 4 8-8"
    fill="none"
    stroke={color}
    strokeWidth={3.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

function Discover() {
  return (
    <>
      <Shadow cx={160} cy={226} rx={70} />
      <Float x={112} y={88} slow>
        <path d="M28 30c0-22 40-22 40 0" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <rect x={0} y={28} width={96} height={108} rx={22} fill={C.coral} />
        <rect x={0} y={28} width={96} height={20} rx={10} fill={C.ink} opacity={0.12} />
        <circle cx={36} cy={80} r={5} fill={C.ink} />
        <circle cx={60} cy={80} r={5} fill={C.ink} />
        <path d="M38 96q10 9 20 0" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      </Float>
      <Float x={22} y={30} delay={-0.8}>
        <ProductCard glyph="shirt" color={C.mint} price="$24" />
      </Float>
      <Float x={222} y={22} delay={-2}>
        <ProductCard glyph="phone" color={C.coral} price="$89" />
      </Float>
      <Float x={14} y={140} delay={-1.4}>
        <g transform="scale(0.8)">
          <ProductCard glyph="lamp" color={C.sun} price="$42" />
        </g>
      </Float>
      <Float x={236} y={140} delay={-2.6}>
        <g transform="scale(0.8)">
          <ProductCard glyph="bottle" color={C.mint} price="$18" />
        </g>
      </Float>
    </>
  );
}

function Compare() {
  return (
    <>
      <Float x={30} y={24} slow>
        <rect width={260} height={42} rx={21} fill={C.white} filter="url(#ob-soft)" />
        <circle cx={26} cy={21} r={8} fill="none" stroke={C.ink} strokeWidth={3} />
        <path d="M32 27l6 6" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        <rect x={50} y={18} width={110} height={6} rx={3} fill={C.line} />
        <rect x={214} y={7} width={38} height={28} rx={14} fill={C.primary} />
        <path d="M226 21h14m-5-5 5 5-5 5" stroke={C.white} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Float>

      <g transform="translate(30 78)">
        {[
          ["Under $50", 66, true],
          ["4★ & up", 58, false],
          ["Verified", 60, false],
        ].map(([t, w, on], i) => {
          const x = [0, 74, 140][i] ?? 0;
          return (
            <g key={String(t)} transform={`translate(${x} 0)`}>
              <rect width={Number(w)} height={24} rx={12} fill={on ? C.ink : C.white} stroke={on ? "none" : C.line} />
              <text x={Number(w) / 2} y={16} fontSize={10} fontWeight={700} textAnchor="middle" fill={on ? C.white : C.ink} fontFamily="var(--font-sans)">
                {String(t)}
              </text>
            </g>
          );
        })}
      </g>

      {[
        { x: 30, g: "watch" as const, c: C.coral, p: "$59", s: 4, best: false, d: -0.5 },
        { x: 170, g: "watch" as const, c: C.mint, p: "$49", s: 5, best: true, d: -1.8 },
      ].map((o) => (
        <Float key={o.x} x={o.x} y={116} delay={o.d}>
          <rect width={120} height={118} rx={18} fill={C.white} stroke={o.best ? C.primary : "none"} strokeWidth={2.5} filter="url(#ob-soft)" />
          <rect x={10} y={10} width={100} height={52} rx={12} fill={C.soft} />
          <g transform="translate(38 14) scale(0.95)">
            <Glyph kind={o.g} color={o.c} />
          </g>
          <g transform="translate(12 72)">
            <Stars n={o.s} />
          </g>
          <rect x={12} y={88} width={56} height={5} rx={2.5} fill={C.line} />
          <text x={12} y={110} fontSize={13} fontWeight={700} fill={C.ink} fontFamily="var(--font-display)">
            {o.p}
          </text>
          {o.best && (
            <g transform="translate(66 -10)">
              <rect width={64} height={22} rx={11} fill={C.primary} />
              <text x={32} y={15} fontSize={9.5} fontWeight={800} textAnchor="middle" fill={C.white} fontFamily="var(--font-sans)">
                BEST PRICE
              </text>
            </g>
          )}
        </Float>
      ))}
    </>
  );
}

function Secure() {
  return (
    <>
      <Shadow cx={150} cy={228} rx={90} />
      <Float x={40} y={70} slow>
        <g transform="rotate(-8 100 60)">
          <rect width={200} height={124} rx={20} fill={C.ink} filter="url(#ob-soft)" />
          <circle cx={170} cy={30} r={14} fill={C.coral} opacity={0.9} />
          <circle cx={152} cy={30} r={14} fill={C.sun} opacity={0.85} />
          <rect x={20} y={46} width={34} height={26} rx={6} fill={C.sun} />
          <rect x={20} y={90} width={96} height={7} rx={3.5} fill={C.white} opacity={0.6} />
          <rect x={20} y={104} width={52} height={6} rx={3} fill={C.white} opacity={0.3} />
        </g>
      </Float>
      <Float x={196} y={24} delay={-1.2}>
        <path d="M44 0 86 14v34c0 28-20 48-42 56C22 96 2 76 2 48V14z" fill={C.mint} filter="url(#ob-soft)" />
        <g transform="translate(44 52)">
          <Check s={1.8} color={C.ink} />
        </g>
      </Float>
      <Float x={22} y={22} delay={-2.2}>
        <rect width={112} height={40} rx={20} fill={C.white} filter="url(#ob-soft)" />
        <circle cx={20} cy={20} r={12} fill={C.primary} />
        <g transform="translate(20 20)">
          <Check s={0.75} />
        </g>
        <text x={40} y={18} fontSize={10} fontWeight={800} fill={C.ink} fontFamily="var(--font-sans)">
          Verified
        </text>
        <text x={40} y={30} fontSize={9} fill={C.ink} opacity={0.55} fontFamily="var(--font-sans)">
          seller
        </text>
      </Float>
      <Float x={236} y={164} delay={-0.4}>
        <path d="M10 18v-6a12 12 0 0 1 24 0v6" fill="none" stroke={C.ink} strokeWidth={5} />
        <rect x={0} y={16} width={44} height={36} rx={10} fill={C.sun} filter="url(#ob-soft)" />
        <circle cx={22} cy={33} r={4.5} fill={C.ink} />
      </Float>
    </>
  );
}

function Store() {
  return (
    <>
      <Shadow cx={150} cy={232} rx={110} />
      <Float x={56} y={34} slow>
        <rect x={6} y={50} width={164} height={142} rx={14} fill={C.white} filter="url(#ob-soft)" />
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${i * 29.3} 30h29.3v24a14.65 14.65 0 0 1-29.3 0z`} fill={i % 2 ? C.white : C.coral} stroke={C.coral} strokeWidth={1.5} />
          ))}
        </g>
        <rect x={-4} y={14} width={184} height={20} rx={10} fill={C.ink} />
        <text x={88} y={28} fontSize={11} fontWeight={800} textAnchor="middle" fill={C.white} fontFamily="var(--font-display)">
          YOUR STORE
        </text>
        <rect x={22} y={92} width={62} height={52} rx={10} fill={C.soft} />
        <rect x={30} y={112} width={16} height={24} rx={4} fill={C.mint} />
        <rect x={52} y={104} width={22} height={32} rx={5} fill={C.sun} />
        <rect x={100} y={92} width={54} height={100} rx={10} fill={C.ink} />
        <circle cx={142} cy={146} r={4} fill={C.sun} />
      </Float>
      <Float x={222} y={128} delay={-1.5}>
        <rect y={34} width={70} height={60} rx={10} fill={C.sun} filter="url(#ob-soft)" />
        <rect x={28} y={34} width={14} height={60} fill={C.ink} opacity={0.12} />
        <rect x={10} width={50} height={40} rx={8} fill={C.coral} />
        <rect x={30} width={10} height={40} fill={C.ink} opacity={0.12} />
      </Float>
      <Float x={18} y={164} delay={-2.4}>
        <rect width={40} height={40} rx={9} fill={C.mint} filter="url(#ob-soft)" />
        <rect x={16} width={8} height={40} fill={C.ink} opacity={0.12} />
      </Float>
    </>
  );
}

function Products() {
  const rows = [
    { c: C.coral, w: 70, s: C.mint },
    { c: C.sun, w: 40, s: C.sun },
    { c: C.mint, w: 14, s: C.coral },
  ];
  return (
    <>
      <Float x={28} y={22} slow>
        <rect width={234} height={200} rx={20} fill={C.white} filter="url(#ob-soft)" />
        <circle cx={20} cy={20} r={5} fill={C.coral} />
        <circle cx={34} cy={20} r={5} fill={C.sun} />
        <circle cx={48} cy={20} r={5} fill={C.mint} />
        <text x={16} y={56} fontSize={14} fontWeight={700} fill={C.ink} fontFamily="var(--font-display)">
          Catalog
        </text>
        {rows.map((r, i) => (
          <g key={i} transform={`translate(16 ${72 + i * 42})`}>
            <rect width={202} height={34} rx={10} fill={C.soft} opacity={0.55} />
            <rect x={6} y={5} width={24} height={24} rx={7} fill={r.c} />
            <rect x={40} y={9} width={64} height={5} rx={2.5} fill={C.ink} opacity={0.75} />
            <rect x={40} y={20} width={84} height={5} rx={2.5} fill={C.line} />
            <rect x={136} y={14} width={56} height={7} rx={3.5} fill={C.line} />
            <rect
              className="ob-grow"
              x={136}
              y={14}
              width={(r.w / 100) * 56}
              height={7}
              rx={3.5}
              fill={r.s}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          </g>
        ))}
      </Float>
      <Float x={244} y={154} delay={-1}>
        <circle cx={26} cy={26} r={26} fill={C.primary} filter="url(#ob-soft)" />
        <path d="M26 15v22M15 26h22" stroke={C.white} strokeWidth={4.5} strokeLinecap="round" />
      </Float>
    </>
  );
}

function Orders() {
  return (
    <>
      <Float x={30} y={30} slow>
        <rect x={14} y={-10} width={200} height={70} rx={16} fill={C.white} opacity={0.6} />
        <rect width={228} height={92} rx={18} fill={C.white} filter="url(#ob-soft)" />
        <text x={16} y={26} fontSize={12} fontWeight={700} fill={C.ink} fontFamily="var(--font-display)">
          Order #2048
        </text>
        <rect x={160} y={12} width={54} height={20} rx={10} fill={C.mint} />
        <text x={187} y={26} fontSize={9} fontWeight={800} textAnchor="middle" fill={C.ink} fontFamily="var(--font-sans)">
          SHIPPED
        </text>
        <g transform="translate(26 62)">
          <rect x={0} y={-2} width={176} height={4} rx={2} fill={C.line} />
          <rect className="ob-grow" x={0} y={-2} width={118} height={4} rx={2} fill={C.primary} />
          {[0, 59, 118, 176].map((x, i) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <circle r={9} fill={i < 3 ? C.primary : C.white} stroke={i < 3 ? "none" : C.line} strokeWidth={2} />
              {i < 3 && <Check s={0.55} />}
            </g>
          ))}
        </g>
      </Float>
      <Shadow cx={160} cy={230} rx={60} />
      <Float x={110} y={130} delay={-1.3}>
        <path d="M0 26 50 4l50 22v54L50 104 0 80z" fill={C.sun} filter="url(#ob-soft)" />
        <path d="M0 26 50 48l50-22M50 48v56" fill="none" stroke={C.ink} strokeOpacity={0.18} strokeWidth={2} />
        <path d="M24 15l50 22v14" fill="none" stroke={C.coral} strokeWidth={8} />
      </Float>
      <Float x={234} y={150} delay={-2.4}>
        <circle cx={22} cy={22} r={22} fill={C.coral} filter="url(#ob-soft)" />
        <path d="M14 22h16m-6-6 6 6-6 6" stroke={C.white} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Float>
    </>
  );
}

function Analytics() {
  const bars = [40, 62, 48, 80, 70, 104];
  return (
    <>
      <Float x={24} y={46} slow>
        <rect width={220} height={176} rx={20} fill={C.white} filter="url(#ob-soft)" />
        <text x={16} y={30} fontSize={12} fontWeight={700} fill={C.ink} fontFamily="var(--font-display)">
          Sales this week
        </text>
        {bars.map((h, i) => (
          <rect
            key={i}
            className="ob-rise-bar"
            x={20 + i * 32}
            y={156 - h}
            width={20}
            height={h}
            rx={6}
            fill={i === bars.length - 1 ? C.primary : C.ink}
            opacity={i === bars.length - 1 ? 1 : 0.85 - (bars.length - i) * 0.08}
            style={{ animationDelay: `${i * 0.06}s` }}
          />
        ))}
        <path d="M30 110 62 90 94 100 126 70 158 78 190 44" fill="none" stroke={C.mint} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={190} cy={44} r={5} fill={C.mint} stroke={C.white} strokeWidth={2} />
      </Float>
      <Float x={186} y={16} delay={-1.6}>
        <rect width={112} height={64} rx={16} fill={C.ink} filter="url(#ob-soft)" />
        <text x={14} y={24} fontSize={9.5} fill={C.white} opacity={0.65} fontFamily="var(--font-sans)">
          Revenue
        </text>
        <text x={14} y={48} fontSize={18} fontWeight={700} fill={C.white} fontFamily="var(--font-display)">
          $12.4k
        </text>
        <rect x={74} y={10} width={30} height={16} rx={8} fill={C.mint} />
        <text x={89} y={22} fontSize={8.5} fontWeight={800} textAnchor="middle" fill={C.ink} fontFamily="var(--font-sans)">
          +24%
        </text>
      </Float>
      <Float x={236} y={160} delay={-0.7}>
        <circle cx={28} cy={28} r={24} fill="none" stroke={C.sun} strokeWidth={10} filter="url(#ob-soft)" />
        <circle cx={28} cy={28} r={24} fill="none" stroke={C.coral} strokeWidth={10} strokeDasharray="60 151" transform="rotate(-90 28 28)" />
      </Float>
    </>
  );
}

const scenes: Record<SceneId, () => ReactNode> = {
  discover: Discover,
  compare: Compare,
  secure: Secure,
  store: Store,
  products: Products,
  orders: Orders,
  analytics: Analytics,
};

export function OnboardingIllustration({ scene }: { scene: SceneId }) {
  const Scene = scenes[scene];
  return (
    <svg viewBox="0 0 320 250" className="h-full w-full" role="img" aria-hidden="true">
      <defs>
        <filter id="ob-soft" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="oklch(0.3 0.03 60)" floodOpacity="0.14" />
        </filter>
      </defs>
      <path
        d="M58 40c40-34 130-38 190-8 54 27 70 110 34 160-38 52-150 60-212 26C14 186-4 92 58 40z"
        fill={C.white}
        opacity={0.55}
      />
      <Scene />
    </svg>
  );
}

/** Small mascot icons for the role-selection cards. */
export function RoleIcon({ role }: { role: "customer" | "vendor" }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      {role === "customer" ? (
        <>
          <path d="M22 20c0-12 20-12 20 0" fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <rect x={12} y={18} width={40} height={40} rx={11} fill={C.coral} />
          <circle cx={26} cy={36} r={3} fill={C.ink} />
          <circle cx={38} cy={36} r={3} fill={C.ink} />
          <path d="M27 44q5 4 10 0" fill="none" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x={10} y={22} width={44} height={36} rx={7} fill={C.white} stroke={C.ink} strokeOpacity={0.12} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${8 + i * 12} 14h12v8a6 6 0 0 1-12 0z`} fill={i % 2 ? C.white : C.mint} stroke={C.mint} strokeWidth={1} />
          ))}
          <rect x={6} y={8} width={52} height={8} rx={4} fill={C.ink} />
          <rect x={36} y={36} width={12} height={22} rx={3} fill={C.ink} />
          <rect x={16} y={36} width={14} height={12} rx={3} fill={C.sun} />
        </>
      )}
    </svg>
  );
}
