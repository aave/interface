import type { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import type { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import type { EmodeCategory } from 'src/helpers/types';
import { hasNonZeroEffectiveLtv } from 'src/utils/hfUtils';

/**
 * A reserve can be a collateral swap destination only when it would actually be
 * enabled as collateral after the swap. That is the effective LTV, not the base
 * LTV: an asset with base LTV 0 can still count as collateral inside the user's
 * e-mode category, and an asset with base LTV above 0 counts for nothing in an
 * isolated e-mode it is outside of. Mirrors on-chain getUserReserveLtv.
 */
export const canBeCollateralSwapDestination = (
  reserve: ComputedReserveData,
  user: ExtendedFormattedUser | undefined,
  eModes: Record<number, EmodeCategory>
): boolean => {
  const toEmode = reserve.eModes?.find((e) => e.id === user?.userEmodeCategoryId);
  return hasNonZeroEffectiveLtv({
    baseLTVasCollateral: reserve.baseLTVasCollateral,
    isInEmode: !!user?.isInEmode,
    emodeEntry: toEmode,
    isEModeIsolated: !!eModes[user?.userEmodeCategoryId ?? 0]?.isolated,
  });
};
