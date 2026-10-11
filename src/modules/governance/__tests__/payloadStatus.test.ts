import { getPayloadLabelKind } from '../utils/payloadStatus';

describe('getPayloadLabelKind', () => {
  it('reports an executed payload as executed', () => {
    expect(getPayloadLabelKind('executed')).toBe('executed');
  });

  // Regression guard for https://github.com/aave/interface/issues/2480: a queued payload is
  // scheduled but has not run, and used to be labelled "executed" on Passed proposals.
  it('reports a queued payload as not executed', () => {
    expect(getPayloadLabelKind('queued')).toBe('not-executed');
  });

  it('does not claim execution for a payload that is only created', () => {
    expect(getPayloadLabelKind('created')).toBe('pending');
  });

  it('reports a cancelled payload as cancelled', () => {
    expect(getPayloadLabelKind('cancelled')).toBe('cancelled');
  });

  it('reports an expired payload as expired', () => {
    expect(getPayloadLabelKind('expired')).toBe('expired');
  });

  // `state` is a free-form string on the cache response, so anything unrecognised must fall
  // back to the non-committal label rather than asserting an on-chain action.
  it.each([['partially_executed'], ['something_new'], [''], [null], [undefined]])(
    'falls back to pending for %p',
    (state) => {
      expect(getPayloadLabelKind(state as string | null | undefined)).toBe('pending');
    }
  );
});
