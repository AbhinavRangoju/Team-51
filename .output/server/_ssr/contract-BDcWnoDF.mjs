//#region node_modules/.nitro/vite/services/ssr/assets/contract-BDcWnoDF.js
/**
* Input limits. Enforced on the server — the client copies are only there to
* stop the textarea sending something that will certainly be rejected.
*/
var HUBBY_LIMITS = {
	/** Longest single question. A shopping query needs nowhere near this. */
	message: 500,
	/** Turns of prior conversation replayed to the model. */
	history: 8,
	/** Longest replayed turn; older turns are truncated rather than dropped. */
	historyTurn: 400,
	/** Requests allowed per client per rolling window. */
	ratePerWindow: 12,
	rateWindowMs: 6e4
};
//#endregion
export { HUBBY_LIMITS };
