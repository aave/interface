import { useTweakParam } from 'src/components/tweaks/tweakParams';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import type { FormattedReservesAndIncentives } from 'src/hooks/pool/usePoolFormattedReserves';

/**
 * Dynamic borrow caps (LlamaRisk Caps Oracle, stage 1).
 *
 * On a reserve with a dynamic cap, the borrow cap the pool enforces (the "current cap") is kept
 * about one buffer above what is borrowed: it is raised automatically when the buffer runs low, cut
 * back after repayments, and never goes above a ceiling (the "max cap"). Read against the current
 * cap alone, such a reserve looks nearly full most of the time.
 *
 * Pool reserve data marks such a reserve with `dynamicBorrowCap`; its `borrowCap` is then the
 * current cap. `DynamicCap` is that, worked out for display. Until the contracts are deployed the
 * mark is SIMULATED, in `simulatedCaps.ts`: nothing here or in the screens knows about it.
 */
export type DynamicCap = {
  /** The cap the pool enforces right now. */
  currentCap: number;
  /** The ceiling the current cap can rise to. */
  maxCap: number;
  borrowed: number;
  /** What can still be borrowed before the current cap is hit. */
  availableNow: number;
  /** Borrowed as a percentage of the current cap: what today's UI shows. */
  usageOfCurrentCap: number;
  /** Borrowed as a percentage of the max cap. */
  usageOfMaxCap: number;
  /** The current cap has reached the max cap and will not rise further. */
  isAtMaxCap: boolean;
  /** The current cap is fully used: borrowing waits for the next raise. */
  isCurrentCapReached: boolean;
};

/**
 * How a dynamic cap is presented. `today` is the unchanged UI; `combined` is the notice with usage
 * measured against the max cap, and the max cap in a column of its own.
 */
export const RESERVE_VARIANTS = ['today', 'notice', 'max-cap', 'vs-max', 'combined'] as const;
export type ReserveVariant = (typeof RESERVE_VARIANTS)[number];
// Today's UI first: reviewers start from what ships and switch to an option from there.
export const DEFAULT_RESERVE_VARIANT: ReserveVariant = 'today';
export const RESERVE_VARIANT_PARAM = 'dyncap';

export const useReserveVariant = () =>
  useTweakParam(RESERVE_VARIANT_PARAM, RESERVE_VARIANTS, DEFAULT_RESERVE_VARIANT);

/** Whether each part of the cap bar lifts on hover and names its amount in a tooltip. */
export const BAR_HOVER_VALUES = ['on', 'off'] as const;
export type BarHover = (typeof BAR_HOVER_VALUES)[number];
export const DEFAULT_BAR_HOVER: BarHover = 'on';
export const BAR_HOVER_PARAM = 'barhover';

export const useBarHover = () =>
  useTweakParam(BAR_HOVER_PARAM, BAR_HOVER_VALUES, DEFAULT_BAR_HOVER);

/**
 * The markets page, switched part by part: the notice above the list, the tag on total borrowed,
 * and a column of its own. Independent of each other and of the reserve page option.
 */
export const ON_OFF = ['on', 'off'] as const;
export type OnOff = (typeof ON_OFF)[number];
export const MARKETS_NOTICE_PARAM = 'mktnotice';
export const MARKETS_TAG_PARAM = 'mkttag';
export const MARKETS_COLUMN_PARAM = 'mktcol';

export const useMarketsNotice = () => useTweakParam(MARKETS_NOTICE_PARAM, ON_OFF, 'on');
export const useMarketsTag = () => useTweakParam(MARKETS_TAG_PARAM, ON_OFF, 'on');
export const useMarketsColumn = () => useTweakParam(MARKETS_COLUMN_PARAM, ON_OFF, 'off');

/** Where "Learn more" points. Placeholder until the public caps dashboard has its address. */
export const DYNAMIC_CAPS_LEARN_MORE_URL = 'https://llamarisk.com';

type ReserveCapData = Pick<
  FormattedReservesAndIncentives,
  'totalDebt' | 'borrowCap' | 'dynamicBorrowCap'
>;

/** The dynamic cap of a pool reserve, or `null` when the reserve's cap is static. */
export const getDynamicCap = (reserve: ReserveCapData | undefined): DynamicCap | null => {
  if (!reserve?.dynamicBorrowCap) return null;

  const borrowed = Number(reserve.totalDebt);
  const currentCap = Number(reserve.borrowCap);
  const maxCap = Number(reserve.dynamicBorrowCap.maxCap);
  if (![borrowed, currentCap, maxCap].every(Number.isFinite) || maxCap <= 0) return null;

  return {
    currentCap,
    maxCap,
    borrowed,
    availableNow: Math.max(currentCap - borrowed, 0),
    usageOfCurrentCap: currentCap > 0 ? (borrowed / currentCap) * 100 : 0,
    usageOfMaxCap: (borrowed / maxCap) * 100,
    isAtMaxCap: currentCap >= maxCap,
    isCurrentCapReached: borrowed >= currentCap * 0.9999,
  };
};

/** Whether any reserve of the current market has a dynamic cap. */
export const useMarketHasDynamicCaps = (): boolean => {
  const { reserves } = useAppDataContext();
  return reserves.some((reserve) => !!reserve.dynamicBorrowCap);
};

/**
 * The dynamic cap of a reserve of the current market, by underlying asset. For screens that hold
 * the reserve in another shape than pool reserve data (the markets list, the reserve page).
 */
export const useDynamicCap = (underlyingAsset: string): DynamicCap | null => {
  const { reserves } = useAppDataContext();
  const asset = underlyingAsset.toLowerCase();
  return getDynamicCap(reserves.find((reserve) => reserve.underlyingAsset.toLowerCase() === asset));
};
