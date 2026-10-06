/**
 * Rupee formatting for amounts that came from the server.
 *
 * The server stores and returns integer paise (see src/lib/server/pricing.ts).
 * `inr()` in src/lib/data.ts formats whole rupees and is still correct for the
 * static catalogue, so this sits alongside it rather than replacing it.
 *
 * Deliberately no rounding or arithmetic here beyond the divide: any figure
 * worth displaying was already computed server-side, and recomputing it in the
 * browser is how the displayed total and the charged total drift apart.
 */

export const paiseToRupees = (paise: number): number => paise / 100;

export function inrPaise(paise: number): string {
  const rupees = paise / 100;
  // Whole rupees render without decimals to match the rest of the UI; only show
  // paise when an amount actually has them.
  const hasPaise = paise % 100 !== 0;
  return (
    "₹" +
    rupees.toLocaleString("en-IN", {
      minimumFractionDigits: hasPaise ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}
