/**
 * Minimal decoder for the seroval envelopes TanStack Start returns.
 *
 * The full `fromCrossJSON` cannot be used here: the envelope carries a
 * framework seroval plugin ("$TSR/Error") whose plugin list is only reachable
 * from inside a Start request context, so decoding from a standalone script
 * throws. Rather than disable the check or guess at the wire format, this
 * handles the node types the server actually emits, which were read off real
 * responses:
 *
 *   t:0  number          { s }
 *   t:1  string          { s }
 *   t:2  constant        { s } 0 -> null, 1 -> undefined, 2 -> true, 3 -> false
 *   t:9  array           { a }
 *   t:10 object          { p: { k, v } }
 *   t:11 object          { p: { k, v } }   (plain/null-prototype object)
 *   t:25 plugin          { c, s }          "$TSR/Error" -> Error
 *
 * Nodes carry an `i` index; a repeated value appears later as a bare
 * { t, i } reference, so every decoded node is registered by index.
 *
 * Only used by scripts/e2e.mjs. Not part of the application.
 */

const CONSTANTS = {
  0: null,
  1: undefined,
  2: true,
  3: false,
  4: NaN,
  5: Infinity,
  6: -Infinity,
  7: -0,
};

export function decodeNode(node, refs = new Map()) {
  if (node === null || typeof node !== "object") return node;

  const { t, i, s, a, p, c } = node;

  // Bare reference to an already-decoded node.
  const isBareRef =
    i !== undefined && s === undefined && a === undefined && p === undefined && c === undefined;
  if (isBareRef && refs.has(i)) return refs.get(i);

  let out;
  switch (t) {
    case 0:
    case 1:
      out = s;
      break;

    case 2:
      out = Object.prototype.hasOwnProperty.call(CONSTANTS, s) ? CONSTANTS[s] : undefined;
      break;

    case 9: {
      out = [];
      if (i !== undefined) refs.set(i, out);
      for (const item of a ?? []) out.push(decodeNode(item, refs));
      return out;
    }

    case 10:
    case 11: {
      out = {};
      if (i !== undefined) refs.set(i, out);
      const keys = p?.k ?? [];
      const values = p?.v ?? [];
      for (let n = 0; n < keys.length; n += 1) out[keys[n]] = decodeNode(values[n], refs);
      return out;
    }

    case 25: {
      // Plugin node. The only one we care about is the error wrapper.
      const payload = {};
      for (const [k, v] of Object.entries(s ?? {})) payload[k] = decodeNode(v, refs);
      if (typeof c === "string" && c.includes("Error")) {
        const err = new Error(payload.message ?? "unknown error");
        Object.assign(err, payload);
        out = err;
      } else {
        out = payload;
      }
      break;
    }

    default:
      // Unknown node type: surface it rather than silently returning undefined,
      // so a wire-format change is visible instead of faking a pass.
      out = { __unknownSerovalNode: t, raw: node };
  }

  if (i !== undefined) refs.set(i, out);
  return out;
}

/** Decodes a full response body into { result, error, context }. */
export function decodeEnvelope(text) {
  const parsed = JSON.parse(text);
  return decodeNode(parsed, new Map());
}
