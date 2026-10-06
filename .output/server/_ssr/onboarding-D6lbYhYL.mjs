import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ArrowRight, Check, Clock, ShieldCheck, ShoppingBag } from "../_libs/lucide-react.mjs";
import { loadOnboarding, roleHome, saveOnboarding } from "./onboarding-store-BRs06JfO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-D6lbYhYL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var C = {
	coral: "var(--mob-coral)",
	ink: "var(--mob-ink)",
	mint: "var(--mob-mint)",
	sun: "var(--mob-sun)",
	white: "var(--mob-eye)",
	line: "var(--border)",
	soft: "var(--accent)",
	primary: "var(--primary)"
};
/** Positions content, then floats it (CSS transform must live on an inner group). */
function Float({ x, y, delay = 0, slow, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		transform: `translate(${x} ${y})`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			className: slow ? "ob-float ob-float-slow" : "ob-float",
			style: { animationDelay: `${delay}s` },
			children
		})
	});
}
var Shadow = ({ cx, cy, rx }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
	cx,
	cy,
	rx,
	ry: rx * .14,
	fill: C.ink,
	opacity: .1
});
function Glyph({ kind, color }) {
	switch (kind) {
		case "shirt": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M10 6 18 2h8l8 4 6 9-7 4-3-4v21H14V15l-3 4-7-4z",
			fill: color
		});
		case "phone": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 26a14 14 0 0 1 28 0",
				fill: "none",
				stroke: color,
				strokeWidth: 5,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 4,
				y: 24,
				width: 10,
				height: 14,
				rx: 4,
				fill: color
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 30,
				y: 24,
				width: 10,
				height: 14,
				rx: 4,
				fill: color
			})
		] });
		case "lamp": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 4h20l6 18H6z",
				fill: color
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 20,
				y: 22,
				width: 4,
				height: 14,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 12,
				y: 35,
				width: 20,
				height: 5,
				rx: 2.5,
				fill: C.ink
			})
		] });
		case "bottle": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: 16,
			y: 2,
			width: 12,
			height: 10,
			rx: 3,
			fill: C.ink
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: 10,
			y: 12,
			width: 24,
			height: 28,
			rx: 8,
			fill: color
		})] });
		case "watch": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 16,
				y: 0,
				width: 12,
				height: 42,
				rx: 5,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 22,
				cy: 21,
				r: 12,
				fill: color
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 22,
				cy: 21,
				r: 6,
				fill: C.white
			})
		] });
	}
}
function ProductCard({ glyph, color, price }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: 78,
			height: 96,
			rx: 16,
			fill: C.white,
			filter: "url(#ob-soft)"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: 8,
			y: 8,
			width: 62,
			height: 50,
			rx: 11,
			fill: C.soft
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			transform: "translate(17 12)",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, {
				kind: glyph,
				color
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: 10,
			y: 66,
			width: 40,
			height: 5,
			rx: 2.5,
			fill: C.ink,
			opacity: .75
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: 10,
			y: 86,
			fontSize: 11,
			fontWeight: 700,
			fill: C.primary,
			fontFamily: "var(--font-display)",
			children: price
		})
	] });
}
var Stars = ({ n }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: [
	0,
	1,
	2,
	3,
	4
].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
	transform: `translate(${i * 11} 0)`,
	d: "M5 0l1.5 3.2 3.5.4-2.6 2.4.7 3.5L5 7.8 1.9 9.5l.7-3.5L0 3.6l3.5-.4z",
	fill: i < n ? C.sun : C.line
}, i)) });
var Check$1 = ({ s = 1, color = C.white }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
	transform: `scale(${s})`,
	d: "M-6 0l4 4 8-8",
	fill: "none",
	stroke: color,
	strokeWidth: 3.2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
});
function Discover() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shadow, {
			cx: 160,
			cy: 226,
			rx: 70
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 112,
			y: 88,
			slow: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M28 30c0-22 40-22 40 0",
					fill: "none",
					stroke: C.ink,
					strokeWidth: 7,
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 0,
					y: 28,
					width: 96,
					height: 108,
					rx: 22,
					fill: C.coral
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 0,
					y: 28,
					width: 96,
					height: 20,
					rx: 10,
					fill: C.ink,
					opacity: .12
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 36,
					cy: 80,
					r: 5,
					fill: C.ink
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 60,
					cy: 80,
					r: 5,
					fill: C.ink
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M38 96q10 9 20 0",
					fill: "none",
					stroke: C.ink,
					strokeWidth: 4,
					strokeLinecap: "round"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			x: 22,
			y: 30,
			delay: -.8,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				glyph: "shirt",
				color: C.mint,
				price: "$24"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			x: 222,
			y: 22,
			delay: -2,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				glyph: "phone",
				color: C.coral,
				price: "$89"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			x: 14,
			y: 140,
			delay: -1.4,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: "scale(0.8)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					glyph: "lamp",
					color: C.sun,
					price: "$42"
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			x: 236,
			y: 140,
			delay: -2.6,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: "scale(0.8)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					glyph: "bottle",
					color: C.mint,
					price: "$18"
				})
			})
		})
	] });
}
function Compare() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 30,
			y: 24,
			slow: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 260,
					height: 42,
					rx: 21,
					fill: C.white,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 26,
					cy: 21,
					r: 8,
					fill: "none",
					stroke: C.ink,
					strokeWidth: 3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M32 27l6 6",
					stroke: C.ink,
					strokeWidth: 3,
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 50,
					y: 18,
					width: 110,
					height: 6,
					rx: 3,
					fill: C.line
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 214,
					y: 7,
					width: 38,
					height: 28,
					rx: 14,
					fill: C.primary
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M226 21h14m-5-5 5 5-5 5",
					stroke: C.white,
					strokeWidth: 2.5,
					fill: "none",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			transform: "translate(30 78)",
			children: [
				[
					"Under $50",
					66,
					true
				],
				[
					"4★ & up",
					58,
					false
				],
				[
					"Verified",
					60,
					false
				]
			].map(([t, w, on], i) => {
				const x = [
					0,
					74,
					140
				][i] ?? 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${x} 0)`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: Number(w),
						height: 24,
						rx: 12,
						fill: on ? C.ink : C.white,
						stroke: on ? "none" : C.line
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: Number(w) / 2,
						y: 16,
						fontSize: 10,
						fontWeight: 700,
						textAnchor: "middle",
						fill: on ? C.white : C.ink,
						fontFamily: "var(--font-sans)",
						children: String(t)
					})]
				}, String(t));
			})
		}),
		[{
			x: 30,
			g: "watch",
			c: C.coral,
			p: "$59",
			s: 4,
			best: false,
			d: -.5
		}, {
			x: 170,
			g: "watch",
			c: C.mint,
			p: "$49",
			s: 5,
			best: true,
			d: -1.8
		}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: o.x,
			y: 116,
			delay: o.d,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 120,
					height: 118,
					rx: 18,
					fill: C.white,
					stroke: o.best ? C.primary : "none",
					strokeWidth: 2.5,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 10,
					y: 10,
					width: 100,
					height: 52,
					rx: 12,
					fill: C.soft
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					transform: "translate(38 14) scale(0.95)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, {
						kind: o.g,
						color: o.c
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					transform: "translate(12 72)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stars, { n: o.s })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 12,
					y: 88,
					width: 56,
					height: 5,
					rx: 2.5,
					fill: C.line
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 12,
					y: 110,
					fontSize: 13,
					fontWeight: 700,
					fill: C.ink,
					fontFamily: "var(--font-display)",
					children: o.p
				}),
				o.best && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(66 -10)",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: 64,
						height: 22,
						rx: 11,
						fill: C.primary
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 32,
						y: 15,
						fontSize: 9.5,
						fontWeight: 800,
						textAnchor: "middle",
						fill: C.white,
						fontFamily: "var(--font-sans)",
						children: "BEST PRICE"
					})]
				})
			]
		}, o.x))
	] });
}
function Secure() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shadow, {
			cx: 150,
			cy: 228,
			rx: 90
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
			x: 40,
			y: 70,
			slow: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "rotate(-8 100 60)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: 200,
						height: 124,
						rx: 20,
						fill: C.ink,
						filter: "url(#ob-soft)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: 170,
						cy: 30,
						r: 14,
						fill: C.coral,
						opacity: .9
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: 152,
						cy: 30,
						r: 14,
						fill: C.sun,
						opacity: .85
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 46,
						width: 34,
						height: 26,
						rx: 6,
						fill: C.sun
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 90,
						width: 96,
						height: 7,
						rx: 3.5,
						fill: C.white,
						opacity: .6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 104,
						width: 52,
						height: 6,
						rx: 3,
						fill: C.white,
						opacity: .3
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 196,
			y: 24,
			delay: -1.2,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M44 0 86 14v34c0 28-20 48-42 56C22 96 2 76 2 48V14z",
				fill: C.mint,
				filter: "url(#ob-soft)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				transform: "translate(44 52)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check$1, {
					s: 1.8,
					color: C.ink
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 22,
			y: 22,
			delay: -2.2,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 112,
					height: 40,
					rx: 20,
					fill: C.white,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 20,
					cy: 20,
					r: 12,
					fill: C.primary
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
					transform: "translate(20 20)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check$1, { s: .75 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 40,
					y: 18,
					fontSize: 10,
					fontWeight: 800,
					fill: C.ink,
					fontFamily: "var(--font-sans)",
					children: "Verified"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 40,
					y: 30,
					fontSize: 9,
					fill: C.ink,
					opacity: .55,
					fontFamily: "var(--font-sans)",
					children: "seller"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 236,
			y: 164,
			delay: -.4,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M10 18v-6a12 12 0 0 1 24 0v6",
					fill: "none",
					stroke: C.ink,
					strokeWidth: 5
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 0,
					y: 16,
					width: 44,
					height: 36,
					rx: 10,
					fill: C.sun,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 22,
					cy: 33,
					r: 4.5,
					fill: C.ink
				})
			]
		})
	] });
}
function Store$1() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shadow, {
			cx: 150,
			cy: 232,
			rx: 110
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 56,
			y: 34,
			slow: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 6,
					y: 50,
					width: 164,
					height: 142,
					rx: 14,
					fill: C.white,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: [
					0,
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: `M${i * 29.3} 30h29.3v24a14.65 14.65 0 0 1-29.3 0z`,
					fill: i % 2 ? C.white : C.coral,
					stroke: C.coral,
					strokeWidth: 1.5
				}, i)) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: -4,
					y: 14,
					width: 184,
					height: 20,
					rx: 10,
					fill: C.ink
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 88,
					y: 28,
					fontSize: 11,
					fontWeight: 800,
					textAnchor: "middle",
					fill: C.white,
					fontFamily: "var(--font-display)",
					children: "YOUR STORE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 22,
					y: 92,
					width: 62,
					height: 52,
					rx: 10,
					fill: C.soft
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 30,
					y: 112,
					width: 16,
					height: 24,
					rx: 4,
					fill: C.mint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 52,
					y: 104,
					width: 22,
					height: 32,
					rx: 5,
					fill: C.sun
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 100,
					y: 92,
					width: 54,
					height: 100,
					rx: 10,
					fill: C.ink
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 142,
					cy: 146,
					r: 4,
					fill: C.sun
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 222,
			y: 128,
			delay: -1.5,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					y: 34,
					width: 70,
					height: 60,
					rx: 10,
					fill: C.sun,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 28,
					y: 34,
					width: 14,
					height: 60,
					fill: C.ink,
					opacity: .12
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 10,
					width: 50,
					height: 40,
					rx: 8,
					fill: C.coral
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 30,
					width: 10,
					height: 40,
					fill: C.ink,
					opacity: .12
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 18,
			y: 164,
			delay: -2.4,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: 40,
				height: 40,
				rx: 9,
				fill: C.mint,
				filter: "url(#ob-soft)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 16,
				width: 8,
				height: 40,
				fill: C.ink,
				opacity: .12
			})]
		})
	] });
}
function Products() {
	const rows = [
		{
			c: C.coral,
			w: 70,
			s: C.mint
		},
		{
			c: C.sun,
			w: 40,
			s: C.sun
		},
		{
			c: C.mint,
			w: 14,
			s: C.coral
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
		x: 28,
		y: 22,
		slow: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: 234,
				height: 200,
				rx: 20,
				fill: C.white,
				filter: "url(#ob-soft)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 20,
				cy: 20,
				r: 5,
				fill: C.coral
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 34,
				cy: 20,
				r: 5,
				fill: C.sun
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 48,
				cy: 20,
				r: 5,
				fill: C.mint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: 16,
				y: 56,
				fontSize: 14,
				fontWeight: 700,
				fill: C.ink,
				fontFamily: "var(--font-display)",
				children: "Catalog"
			}),
			rows.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: `translate(16 ${72 + i * 42})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: 202,
						height: 34,
						rx: 10,
						fill: C.soft,
						opacity: .55
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 6,
						y: 5,
						width: 24,
						height: 24,
						rx: 7,
						fill: r.c
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 9,
						width: 64,
						height: 5,
						rx: 2.5,
						fill: C.ink,
						opacity: .75
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 20,
						width: 84,
						height: 5,
						rx: 2.5,
						fill: C.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 136,
						y: 14,
						width: 56,
						height: 7,
						rx: 3.5,
						fill: C.line
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						className: "ob-grow",
						x: 136,
						y: 14,
						width: r.w / 100 * 56,
						height: 7,
						rx: 3.5,
						fill: r.s,
						style: { animationDelay: `${i * .12}s` }
					})
				]
			}, i))
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
		x: 244,
		y: 154,
		delay: -1,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: 26,
			cy: 26,
			r: 26,
			fill: C.primary,
			filter: "url(#ob-soft)"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M26 15v22M15 26h22",
			stroke: C.white,
			strokeWidth: 4.5,
			strokeLinecap: "round"
		})]
	})] });
}
function Orders() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 30,
			y: 30,
			slow: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 14,
					y: -10,
					width: 200,
					height: 70,
					rx: 16,
					fill: C.white,
					opacity: .6
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 228,
					height: 92,
					rx: 18,
					fill: C.white,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 16,
					y: 26,
					fontSize: 12,
					fontWeight: 700,
					fill: C.ink,
					fontFamily: "var(--font-display)",
					children: "Order #2048"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 160,
					y: 12,
					width: 54,
					height: 20,
					rx: 10,
					fill: C.mint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 187,
					y: 26,
					fontSize: 9,
					fontWeight: 800,
					textAnchor: "middle",
					fill: C.ink,
					fontFamily: "var(--font-sans)",
					children: "SHIPPED"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: "translate(26 62)",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							x: 0,
							y: -2,
							width: 176,
							height: 4,
							rx: 2,
							fill: C.line
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
							className: "ob-grow",
							x: 0,
							y: -2,
							width: 118,
							height: 4,
							rx: 2,
							fill: C.primary
						}),
						[
							0,
							59,
							118,
							176
						].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							transform: `translate(${x} 0)`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								r: 9,
								fill: i < 3 ? C.primary : C.white,
								stroke: i < 3 ? "none" : C.line,
								strokeWidth: 2
							}), i < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check$1, { s: .55 })]
						}, x))
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shadow, {
			cx: 160,
			cy: 230,
			rx: 60
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 110,
			y: 130,
			delay: -1.3,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0 26 50 4l50 22v54L50 104 0 80z",
					fill: C.sun,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0 26 50 48l50-22M50 48v56",
					fill: "none",
					stroke: C.ink,
					strokeOpacity: .18,
					strokeWidth: 2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M24 15l50 22v14",
					fill: "none",
					stroke: C.coral,
					strokeWidth: 8
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 234,
			y: 150,
			delay: -2.4,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 22,
				cy: 22,
				r: 22,
				fill: C.coral,
				filter: "url(#ob-soft)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M14 22h16m-6-6 6 6-6 6",
				stroke: C.white,
				strokeWidth: 3,
				fill: "none",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})]
		})
	] });
}
function Analytics() {
	const bars = [
		40,
		62,
		48,
		80,
		70,
		104
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 24,
			y: 46,
			slow: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 220,
					height: 176,
					rx: 20,
					fill: C.white,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 16,
					y: 30,
					fontSize: 12,
					fontWeight: 700,
					fill: C.ink,
					fontFamily: "var(--font-display)",
					children: "Sales this week"
				}),
				bars.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					className: "ob-rise-bar",
					x: 20 + i * 32,
					y: 156 - h,
					width: 20,
					height: h,
					rx: 6,
					fill: i === bars.length - 1 ? C.primary : C.ink,
					opacity: i === bars.length - 1 ? 1 : .85 - (bars.length - i) * .08,
					style: { animationDelay: `${i * .06}s` }
				}, i)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M30 110 62 90 94 100 126 70 158 78 190 44",
					fill: "none",
					stroke: C.mint,
					strokeWidth: 3.5,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: 190,
					cy: 44,
					r: 5,
					fill: C.mint,
					stroke: C.white,
					strokeWidth: 2
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 186,
			y: 16,
			delay: -1.6,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: 112,
					height: 64,
					rx: 16,
					fill: C.ink,
					filter: "url(#ob-soft)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 14,
					y: 24,
					fontSize: 9.5,
					fill: C.white,
					opacity: .65,
					fontFamily: "var(--font-sans)",
					children: "Revenue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 14,
					y: 48,
					fontSize: 18,
					fontWeight: 700,
					fill: C.white,
					fontFamily: "var(--font-display)",
					children: "$12.4k"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: 74,
					y: 10,
					width: 30,
					height: 16,
					rx: 8,
					fill: C.mint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: 89,
					y: 22,
					fontSize: 8.5,
					fontWeight: 800,
					textAnchor: "middle",
					fill: C.ink,
					fontFamily: "var(--font-sans)",
					children: "+24%"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Float, {
			x: 236,
			y: 160,
			delay: -.7,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 28,
				cy: 28,
				r: 24,
				fill: "none",
				stroke: C.sun,
				strokeWidth: 10,
				filter: "url(#ob-soft)"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 28,
				cy: 28,
				r: 24,
				fill: "none",
				stroke: C.coral,
				strokeWidth: 10,
				strokeDasharray: "60 151",
				transform: "rotate(-90 28 28)"
			})]
		})
	] });
}
var scenes = {
	discover: Discover,
	compare: Compare,
	secure: Secure,
	store: Store$1,
	products: Products,
	orders: Orders,
	analytics: Analytics
};
function OnboardingIllustration({ scene }) {
	const Scene = scenes[scene];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 320 250",
		className: "h-full w-full",
		role: "img",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "ob-soft",
				x: "-30%",
				y: "-30%",
				width: "160%",
				height: "170%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "0",
					dy: "8",
					stdDeviation: "8",
					floodColor: "oklch(0.3 0.03 60)",
					floodOpacity: "0.14"
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M58 40c40-34 130-38 190-8 54 27 70 110 34 160-38 52-150 60-212 26C14 186-4 92 58 40z",
				fill: C.white,
				opacity: .55
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
		]
	});
}
/** Small mascot icons for the role-selection cards. */
function RoleIcon({ role }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 64 64",
		className: "h-full w-full",
		"aria-hidden": "true",
		children: role === "customer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M22 20c0-12 20-12 20 0",
				fill: "none",
				stroke: C.ink,
				strokeWidth: 4,
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 12,
				y: 18,
				width: 40,
				height: 40,
				rx: 11,
				fill: C.coral
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 26,
				cy: 36,
				r: 3,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: 38,
				cy: 36,
				r: 3,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M27 44q5 4 10 0",
				fill: "none",
				stroke: C.ink,
				strokeWidth: 2.5,
				strokeLinecap: "round"
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 10,
				y: 22,
				width: 44,
				height: 36,
				rx: 7,
				fill: C.white,
				stroke: C.ink,
				strokeOpacity: .12
			}),
			[
				0,
				1,
				2,
				3
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M${8 + i * 12} 14h12v8a6 6 0 0 1-12 0z`,
				fill: i % 2 ? C.white : C.mint,
				stroke: C.mint,
				strokeWidth: 1
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 6,
				y: 8,
				width: 52,
				height: 8,
				rx: 4,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 36,
				y: 36,
				width: 12,
				height: 22,
				rx: 3,
				fill: C.ink
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: 16,
				y: 36,
				width: 14,
				height: 12,
				rx: 3,
				fill: C.sun
			})
		] })
	});
}
var customerSlides = [
	{
		id: "discover",
		label: "Discover",
		scene: "discover",
		title: "Discover what you love",
		text: "Explore products from multiple trusted sellers, all in one place."
	},
	{
		id: "compare",
		label: "Compare",
		scene: "compare",
		title: "Search. Compare. Choose.",
		text: "Find products faster with powerful search, filters, ratings, and seller information."
	},
	{
		id: "secure",
		label: "Secure",
		scene: "secure",
		title: "Shop with confidence",
		text: "Compare verified sellers, review product information, and enjoy a secure checkout experience."
	}
];
var vendorSlides = [
	{
		id: "store",
		label: "Store",
		scene: "store",
		title: "Build your store on MarketHub",
		text: "Reach customers, showcase your products, and grow your business from one place."
	},
	{
		id: "products",
		label: "Products",
		scene: "products",
		title: "Your products. Your store.",
		text: "Add products, manage pricing and inventory, and keep your catalog up to date."
	},
	{
		id: "orders",
		label: "Orders",
		scene: "orders",
		title: "Stay on top of every order",
		text: "Track incoming orders, update order status, and keep your customers informed."
	},
	{
		id: "analytics",
		label: "Analytics",
		scene: "analytics",
		title: "Understand your business",
		text: "Track sales, revenue, orders, and your best-performing products."
	}
];
var shoppingCategories = [
	"Fashion",
	"Electronics",
	"Home & Living",
	"Beauty",
	"Sports",
	"Books",
	"Accessories",
	"Grocery",
	"Other"
];
var businessCategories = [
	"Fashion",
	"Electronics",
	"Home & Living",
	"Beauty",
	"Sports",
	"Books",
	"Food",
	"Handmade",
	"Other"
];
function journey(role) {
	if (role === "vendor") return [
		{ kind: "role" },
		...vendorSlides.map((slide) => ({
			kind: "slide",
			slide
		})),
		{ kind: "setup" }
	];
	return [
		{ kind: "role" },
		...customerSlides.map((slide) => ({
			kind: "slide",
			slide
		})),
		{ kind: "prefs" }
	];
}
function ProgressIndicator({ total, current }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-1.5",
		role: "progressbar",
		"aria-valuemin": 1,
		"aria-valuemax": total,
		"aria-valuenow": current + 1,
		"aria-label": `Step ${current + 1} of ${total}`,
		children: Array.from({ length: total }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 rounded-full transition-all duration-500 ${i === current ? "w-6 bg-primary" : i < current ? "w-2 bg-foreground/70" : "w-2 bg-border"}` }, i))
	});
}
function Btn({ variant = "primary", className = "", ...p }) {
	const v = {
		primary: "bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:brightness-105 disabled:opacity-40 disabled:shadow-none",
		ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
		outline: "border bg-card text-foreground hover:bg-secondary"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		...p,
		className: `inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed ${v} ${className}`
	});
}
function OnboardingNavigation({ left, right }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ob-rise mt-auto flex items-center justify-between gap-3 pt-6",
		style: { animationDelay: "0.28s" },
		children: [left ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), right]
	});
}
function OnboardingPanel({ slide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "ob-illus relative aspect-[32/25] w-full overflow-hidden rounded-[1.6rem] bg-scene",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingIllustration, { scene: slide.scene })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-7 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight",
			style: { animationDelay: "0.08s" },
			children: slide.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "ob-rise mx-auto mt-3 max-w-[30ch] text-muted-foreground",
			style: { animationDelay: "0.16s" },
			children: slide.text
		})]
	})] });
}
function RoleSelectionCard({ role, title, tag, text, selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		role: "radio",
		"aria-checked": selected,
		onClick: onSelect,
		className: `group relative flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${selected ? "-translate-y-1 border-primary shadow-[0_18px_40px_-20px_var(--primary)]" : "border-border hover:-translate-y-0.5 hover:border-foreground/25"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-scene p-2 ${selected ? "ob-pop" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleIcon, { role })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent-foreground",
						children: tag
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-lg font-bold leading-tight",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm text-muted-foreground",
						children: text
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`,
				children: selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					size: 14,
					strokeWidth: 3
				})
			})
		]
	});
}
function Chip({ label, on, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": on,
		onClick,
		className: `inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${on ? "border-foreground bg-foreground text-card" : "bg-card text-foreground hover:border-foreground/30"}`,
		children: [on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			size: 14,
			strokeWidth: 3
		}), label]
	});
}
function PreferenceSelector({ value, onChange }) {
	const toggle = (c) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap justify-center gap-2",
		role: "group",
		"aria-label": "Shopping interests",
		children: shoppingCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
			label: c,
			on: value.includes(c),
			onClick: () => toggle(c)
		}, c))
	});
}
var setupStages = [
	"Store Information",
	"Business Details",
	"Verification",
	"Your Store"
];
var inputCls = "h-12 w-full rounded-xl border bg-card px-4 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-destructive";
function VendorSetupForm({ onBack, onLater, onDone }) {
	const [stage, setStage] = (0, import_react.useState)(0);
	const [f, setF] = (0, import_react.useState)({
		name: "",
		category: "",
		description: "",
		email: "",
		phone: ""
	});
	const [err, setErr] = (0, import_react.useState)({});
	const set = (k) => (v) => setF((s) => ({
		...s,
		[k]: v
	}));
	const next = () => {
		const e = {};
		if (stage === 0) {
			if (!f.name.trim()) e.name = "Give your store a name.";
			if (!f.category) e.category = "Pick a category.";
		} else {
			if (f.description.trim().length < 10) e.description = "Add a short description (10+ characters).";
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid contact email.";
		}
		setErr(e);
		if (Object.keys(e).length) return;
		if (stage === 0) setStage(1);
		else {
			saveOnboarding({ vendorSetupStatus: "submitted" });
			setStage(2);
		}
	};
	const Stages = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "mb-6 grid grid-cols-4 gap-1.5",
		children: setupStages.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-1.5 rounded-full transition-colors duration-500 ${i < stage || stage === 2 && i === 2 ? "bg-foreground/70" : i === stage ? "bg-primary" : "bg-border"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `mt-1.5 block text-[10.5px] font-semibold leading-tight ${i === stage ? "text-foreground" : "text-muted-foreground"}`,
				children: s
			})]
		}, s))
	});
	if (stage === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ob-panel-in flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ob-illus relative aspect-[32/25] w-full overflow-hidden rounded-[1.6rem] bg-scene",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingIllustration, { scene: "store" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight",
						children: "Your store setup is complete."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "ob-rise mx-auto mt-3 max-w-[32ch] text-muted-foreground",
						style: { animationDelay: "0.1s" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: f.name
						}), " is ready. Your vendor profile may require verification before certain selling features become available."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ob-rise mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left text-sm",
						style: { animationDelay: "0.18s" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 rounded-xl bg-secondary px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								size: 16,
								className: "text-success"
							}), " Store information submitted"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 rounded-xl bg-secondary px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								size: 16,
								className: "text-accent-foreground"
							}), " Verification pending"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingNavigation, { right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				className: "w-full",
				onClick: onDone,
				children: ["Go to Vendor Dashboard ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })]
			}) })
		]
	}, "done");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ob-panel-in flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight",
				children: "Let's set up your store"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "ob-rise mb-5 mt-1.5 text-muted-foreground",
				style: { animationDelay: "0.06s" },
				children: "Just the essentials — you can add a logo and banner later."
			}),
			Stages,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ob-rise space-y-4",
				style: { animationDelay: "0.12s" },
				children: stage === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Store / business name",
					error: err.name,
					id: "store-name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "store-name",
						className: inputCls,
						placeholder: "e.g. Juniper & Co.",
						value: f.name,
						"aria-invalid": !!err.name,
						onChange: (e) => set("name")(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Business category",
					error: err.category,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: businessCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: c,
							on: f.category === c,
							onClick: () => set("category")(c)
						}, c))
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Store description",
						error: err.description,
						id: "store-desc",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "store-desc",
							rows: 3,
							className: `${inputCls} h-auto resize-none py-3`,
							placeholder: "What do you sell, and what makes it special?",
							value: f.description,
							"aria-invalid": !!err.description,
							onChange: (e) => set("description")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Contact email",
						error: err.email,
						id: "store-email",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "store-email",
							type: "email",
							className: inputCls,
							placeholder: "hello@yourstore.com",
							value: f.email,
							"aria-invalid": !!err.email,
							onChange: (e) => set("email")(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone (optional)",
						id: "store-phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "store-phone",
							type: "tel",
							className: inputCls,
							placeholder: "+1 555 000 0000",
							value: f.phone,
							onChange: (e) => set("phone")(e.target.value)
						})
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingNavigation, {
				left: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "ghost",
					onClick: stage === 0 ? onBack : () => setStage(0),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 18 }), " Back"]
				}),
				right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						variant: "ghost",
						onClick: onLater,
						className: "px-3 text-sm",
						children: "Finish later"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: next,
						children: [
							stage === 0 ? "Next" : "Submit",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
						]
					})]
				})
			})
		]
	}, stage);
}
function Field({ label, error, id, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "text-sm font-semibold",
				children: label
			}),
			children,
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "animate-fade-in text-xs font-medium text-destructive",
				children: error
			})
		]
	});
}
function OnboardingContainer() {
	const navigate = useNavigate();
	const [role, setRole] = (0, import_react.useState)(null);
	const [i, setI] = (0, import_react.useState)(0);
	const [dir, setDir] = (0, import_react.useState)(1);
	const [prefs, setPrefs] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const s = loadOnboarding();
		if (s.onboardingCompleted) {
			navigate({ to: roleHome(s.selectedRole) });
			return;
		}
		if (s.selectedRole) {
			setRole(s.selectedRole);
			setI(Math.min(s.onboardingStep, journey(s.selectedRole).length - 1));
		}
		setPrefs(s.customerPreferences);
	}, [navigate]);
	const steps = journey(role);
	const step = steps[i] ?? steps[0];
	const last = steps.length - 1;
	const go = (to) => {
		setDir(to >= i ? 1 : -1);
		setI(to);
		saveOnboarding({ onboardingStep: to });
	};
	const finish = (r) => {
		saveOnboarding({
			onboardingCompleted: true,
			selectedRole: r,
			customerPreferences: prefs
		});
		navigate({ to: roleHome(r) });
	};
	let body;
	if (step.kind === "role") body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ob-rise text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-ink text-primary-foreground ob-pop",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { size: 24 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-[2rem] font-bold leading-tight tracking-tight",
					children: "Welcome to MarketHub"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "How would you like to use MarketHub?"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "radiogroup",
			"aria-label": "Choose how to use MarketHub",
			className: "ob-rise mt-7 space-y-3",
			style: { animationDelay: "0.12s" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleSelectionCard, {
					role: "customer",
					tag: "Shop",
					title: "Shop on MarketHub",
					text: "Discover products, compare sellers, and shop securely.",
					selected: role === "customer",
					onSelect: () => setRole("customer")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
						"or",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoleSelectionCard, {
					role: "vendor",
					tag: "Sell",
					title: "Sell on MarketHub",
					text: "Create your store, list products, and manage your orders.",
					selected: role === "vendor",
					onSelect: () => setRole("vendor")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "ob-rise mt-4 text-center text-xs text-muted-foreground",
			style: { animationDelay: "0.2s" },
			children: "You can change this later in your profile."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingNavigation, { right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
			className: "w-full",
			disabled: !role,
			onClick: () => {
				if (role) {
					saveOnboarding({ selectedRole: role });
					go(1);
				}
			},
			children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })]
		}) })
	] });
	else if (step.kind === "slide") {
		const first = i === 1;
		const label = i === last - 1 ? role === "vendor" ? "Continue" : "Get Started" : "Next";
		body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingPanel, { slide: step.slide }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingNavigation, {
			left: first ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "ghost",
				onClick: () => go(last),
				children: "Skip"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "ghost",
				onClick: () => go(i - 1),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 18 }), " Back"]
			}),
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				onClick: () => go(i + 1),
				children: [
					label,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
				]
			})
		})] });
	} else if (step.kind === "prefs") body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "ob-rise font-display text-[1.75rem] font-bold leading-tight tracking-tight",
				children: "What are you shopping for?"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "ob-rise mx-auto mb-7 mt-2 max-w-[30ch] text-muted-foreground",
				style: { animationDelay: "0.06s" },
				children: "Pick a few — we'll tailor your home page, deals and picks. Totally optional."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ob-rise",
			style: { animationDelay: "0.12s" },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreferenceSelector, {
				value: prefs,
				onChange: (v) => {
					setPrefs(v);
					saveOnboarding({ customerPreferences: v });
				}
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto space-y-2 pt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				className: "ob-rise w-full",
				style: { animationDelay: "0.2s" },
				onClick: () => finish("customer"),
				children: [
					"Start Shopping",
					prefs.length ? ` · ${prefs.length}` : "",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 18 })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "ghost",
					onClick: () => go(i - 1),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 18 }), " Back"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "ghost",
					onClick: () => {
						setPrefs([]);
						saveOnboarding({
							onboardingCompleted: true,
							selectedRole: "customer",
							customerPreferences: []
						});
						navigate({ to: "/shop" });
					},
					children: "Skip for now"
				})]
			})]
		})
	] });
	else body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VendorSetupForm, {
		onBack: () => go(i - 1),
		onLater: () => {
			saveOnboarding({ vendorSetupStatus: "in_progress" });
			finish("vendor");
		},
		onDone: () => finish("vendor")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-[100dvh] items-center justify-center sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-card px-5 pb-6 pt-5 sm:min-h-[760px] sm:max-w-[460px] sm:rounded-[2.25rem] sm:px-7 sm:pb-7 sm:shadow-[var(--shadow-card)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2 font-display text-[15px] font-bold tracking-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-7 w-7 place-items-center rounded-lg bg-ink text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { size: 14 })
					}), "MarketHub"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressIndicator, {
					total: steps.length,
					current: i
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `flex flex-1 flex-col ${dir > 0 ? "ob-in-right" : "ob-in-left"}`,
				children: body
			}, `${role}-${i}`)]
		})
	});
}
var SplitComponent = OnboardingContainer;
//#endregion
export { SplitComponent as component };
