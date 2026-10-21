/**
 * Which claim the timeline is allowed to make about a payload, derived from the
 * payload state reported by the governance cache.
 *
 * Kept separate from the rendering so the mapping can be unit tested: asserting
 * that a non-executed payload never produces an "executed" label is the whole
 * point (see https://github.com/aave/interface/issues/2480).
 */
export type PayloadLabelKind = 'executed' | 'not-executed' | 'cancelled' | 'expired' | 'pending';

/**
 * `ProposalPayload.state` is a free-form string on the cache response, so an
 * unrecognised value must fall back to the non-committal 'pending' — never to
 * 'executed', which would assert an on-chain action that may not have happened.
 */
export const getPayloadLabelKind = (state: string | null | undefined): PayloadLabelKind => {
  switch (state) {
    case 'executed':
      return 'executed';
    case 'cancelled':
      return 'cancelled';
    case 'expired':
      return 'expired';
    // Queued means the timelock is running: bridged and scheduled, but not run yet.
    case 'queued':
      return 'not-executed';
    default:
      return 'pending';
  }
};
