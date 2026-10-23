/**
 * Pure helpers for the market switcher's legacy section.
 *
 * Legacy markets are collapsed behind a "Show legacy markets" switch. That also hid them from
 * search, so searching for one reported "No markets found" while the match sat in the
 * un-rendered legacy group (https://github.com/aave/interface/issues/3127).
 */

/**
 * Legacy markets stay collapsed by default, but an explicit search must never hide a match —
 * typing a market name has already said which market the user wants.
 */
export const shouldShowLegacySection = ({
  showLegacy,
  searchQuery,
  legacyCount,
}: {
  showLegacy: boolean;
  searchQuery: string;
  legacyCount: number;
}): boolean => legacyCount > 0 && (showLegacy || searchQuery.trim() !== '');

/**
 * "No markets found" has to account for every group a match can land in, legacy included,
 * otherwise a legacy-only match is reported as no match at all.
 */
export const hasNoMarketResults = (groupCounts: number[]): boolean =>
  groupCounts.every((count) => count === 0);
