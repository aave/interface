import { hasNoMarketResults, shouldShowLegacySection } from '../marketSwitcher.utils';

describe('shouldShowLegacySection', () => {
  it('keeps legacy markets collapsed by default', () => {
    expect(shouldShowLegacySection({ showLegacy: false, searchQuery: '', legacyCount: 3 })).toBe(
      false
    );
  });

  it('shows legacy markets when the switch is on', () => {
    expect(shouldShowLegacySection({ showLegacy: true, searchQuery: '', legacyCount: 3 })).toBe(
      true
    );
  });

  // Regression guard for https://github.com/aave/interface/issues/3127: searching for a legacy
  // market used to report "No markets found" because the match was never rendered.
  it('shows a searched-for legacy market even while the switch is off', () => {
    expect(
      shouldShowLegacySection({ showLegacy: false, searchQuery: 'gnosis', legacyCount: 1 })
    ).toBe(true);
  });

  it('stays hidden when a search matches no legacy market', () => {
    expect(
      shouldShowLegacySection({ showLegacy: false, searchQuery: 'base', legacyCount: 0 })
    ).toBe(false);
  });

  it('treats a whitespace-only query as no search', () => {
    expect(shouldShowLegacySection({ showLegacy: false, searchQuery: '   ', legacyCount: 3 })).toBe(
      false
    );
  });
});

describe('hasNoMarketResults', () => {
  it('reports no results when every group is empty', () => {
    expect(hasNoMarketResults([0, 0, 0, 0, 0, 0, 0])).toBe(true);
  });

  // The other half of #3127: legacy has to count, or a legacy-only match renders the empty state.
  it('does not report no results when only a legacy market matched', () => {
    expect(hasNoMarketResults([0, 0, 0, 0, 1, 0, 0])).toBe(false);
  });

  it('does not report no results when a non-legacy group matched', () => {
    expect(hasNoMarketResults([0, 2, 0, 0, 0, 0, 0])).toBe(false);
  });
});
