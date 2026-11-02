import type { FunSupplyReserve } from './funSupplyAssets';

/**
 * Imperative bridge between the native supply modal (pre-rendered tree) and funkit's
 * checkout (an `ssr: false` island — `@funkit/connect` is client-only, and this
 * app pre-renders/static-exports). The island registers its `beginSupply` impl
 * on mount; the modal's deposit-options link invokes it at click time. No context/state on purpose: React
 * never renders from this value, so subscription machinery would be dead weight
 * (it's also what previously forced the setState + ref-dance layers).
 */
let impl: ((reserve: FunSupplyReserve) => void) | null = null;

/** Called by FunkitCheckout on mount. Returns an unregister cleanup. */
export function registerFunSupply(fn: (reserve: FunSupplyReserve) => void): () => void {
  impl = fn;
  return () => {
    if (impl === fn) {
      impl = null;
    }
  };
}

/**
 * Opens the funkit checkout for `reserve`. Returns false when the island hasn't
 * mounted yet (dynamic chunk still loading) — the native supply modal stays
 * open instead of dropping the user.
 */
export function beginFunSupply(reserve: FunSupplyReserve): boolean {
  if (!impl) {
    return false;
  }
  impl(reserve);
  return true;
}
