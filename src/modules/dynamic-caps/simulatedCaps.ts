import { TWEAKS_ENABLED, useTweakParam } from 'src/components/tweaks/tweakParams';

/**
 * PREVIEW ONLY. Stands in for the dynamic cap contracts, which are not deployed yet.
 *
 * It rewrites pool reserve data into what the chain would report on a reserve with a dynamic cap:
 * `borrowCap` becomes the current cap, and `dynamicBorrowCap.maxCap` carries the ceiling. Everything
 * that reads pool reserve data (the reserve's actions, the borrow modal, the dashboard, the cap
 * warnings) then behaves as it would in production, with no simulation code of its own.
 *
 * The live borrowed amount is kept, the reserve's real (static) borrow cap plays the max cap, and
 * the current cap is placed just above borrowing, where a dynamic cap would hold it.
 *
 * To go live, delete this file and set `dynamicBorrowCap` in `usePoolsFormattedReserves` from the
 * contracts instead. Per the contracts in audit on 2026-11-11 (names may still change):
 *
 *   - which reserves are dynamic: registry `getReservesListByKind(pool, 0)` lists them, enabled or
 *                                 not. A reserve has a dynamic cap when it is listed, enabled and
 *                                 its max cap is above 0; `getReservesRaiseData(pool, 0, assets)`
 *                                 returns all three for a whole market in one call.
 *   - max cap:                    validation module `getKeyState(asset, 0).maxCap`
 *   - current cap and borrowed:   already in reserve data (the pool's own borrow cap)
 */

/** Simulated state of the cap, so every option can be judged in the states it has to survive. */
export const CAP_SCENARIOS = ['topped-up', 'headroom', 'cap-reached', 'at-max'] as const;
export type CapScenario = (typeof CAP_SCENARIOS)[number];
export const DEFAULT_CAP_SCENARIO: CapScenario = 'headroom';
export const CAP_SCENARIO_PARAM = 'capstate';

export const useCapScenario = () =>
  useTweakParam(CAP_SCENARIO_PARAM, CAP_SCENARIOS, DEFAULT_CAP_SCENARIO);

/**
 * Reserves treated as having a dynamic cap, by market. The pilot is Arbitrum; USDC is the reserve
 * the proposal was mocked on.
 */
const SIMULATED_RESERVES: Record<string, string[]> = {
  proto_arbitrum_v3: ['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
};

/** Share of the simulated current cap that is borrowed: the proposal's 179.60M of 181.00M. */
const SIMULATED_USAGE = 179.6 / 181;

/**
 * Draft production parameters (10 November 2026, not final): the buffer kept above borrowing is 10%
 * of debt, at most $15M and at least a 25th of that, and a raise lands 1% of the buffer short of it.
 * In token units, which is only right for a dollar stablecoin: fine for the one simulated reserve.
 */
const BUFFER_SHARE_OF_DEBT = 0.1;
const MAX_BUFFER = 15_000_000;
const RAISE_MARGIN = 0.01;

const fullBuffer = (borrowed: number) =>
  Math.max(MAX_BUFFER / 25, Math.min(MAX_BUFFER, BUFFER_SHARE_OF_DEBT * borrowed));

const isSimulatedReserve = (market: string, underlyingAsset: string): boolean =>
  TWEAKS_ENABLED && (SIMULATED_RESERVES[market] ?? []).includes(underlyingAsset.toLowerCase());

export const marketHasDynamicCaps = (market: string): boolean =>
  TWEAKS_ENABLED && (SIMULATED_RESERVES[market] ?? []).length > 0;

/** Caps are whole tokens on chain, so the simulated ones are too. */
const simulate = (borrowed: number, onChainCap: number, scenario: CapScenario) => {
  const tightCap = Math.floor(Math.min(borrowed / SIMULATED_USAGE, onChainCap));
  switch (scenario) {
    case 'topped-up':
      return {
        currentCap: Math.floor(
          Math.min(borrowed + fullBuffer(borrowed) * (1 - RAISE_MARGIN), onChainCap)
        ),
        maxCap: onChainCap,
      };
    case 'cap-reached':
      // Debt keeps accruing interest, so on a used-up cap it sits a little above the cap.
      return { currentCap: Math.floor(borrowed), maxCap: onChainCap };
    case 'at-max':
      return { currentCap: tightCap, maxCap: tightCap };
    default:
      return { currentCap: tightCap, maxCap: onChainCap };
  }
};

type ReserveCapFields = {
  underlyingAsset: string;
  totalDebt: string;
  borrowCap: string;
  borrowCapUSD: string;
  priceInUSD: string;
  dynamicBorrowCap?: { maxCap: string };
};

/** Pool reserves of one market, with the simulated dynamic caps written into them. */
export const withSimulatedDynamicCaps = <T extends ReserveCapFields>(
  reserves: T[],
  market: string,
  scenario: CapScenario
): T[] => {
  if (!marketHasDynamicCaps(market)) return reserves;

  return reserves.map((reserve) => {
    if (!isSimulatedReserve(market, reserve.underlyingAsset)) return reserve;

    const borrowed = Number(reserve.totalDebt);
    const onChainCap = Number(reserve.borrowCap);
    if (!Number.isFinite(borrowed) || !Number.isFinite(onChainCap) || onChainCap <= 0) {
      return reserve;
    }

    const { currentCap, maxCap } = simulate(borrowed, onChainCap, scenario);
    return {
      ...reserve,
      borrowCap: String(currentCap),
      borrowCapUSD: String(currentCap * Number(reserve.priceInUSD)),
      dynamicBorrowCap: { maxCap: String(maxCap) },
    };
  });
};
