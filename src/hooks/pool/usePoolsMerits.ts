/**
 * Per-market Merit APR lookup for the net-APY calculation in
 * `useUserYield`.
 *
 * Reads directly from the SDK's `markets()` query (same react-query cache
 * as `useAppDataProvider`'s `useMarketsData`), extracts each reserve's
 * active `MeritSupply/Borrow/Conditional` incentive, and keys by
 * underlying address. The backend already evaluates `userEligible` when
 * the user address is passed, so we only credit APR for reserves the user
 * is actually eligible for — same behaviour as the legacy aavechan
 * per-user fetch.
 *
 * No new GraphQL query: the shared cache means calling this hook
 * alongside the main AppDataProvider fetch is a cache hit.
 */
import { chainId as sdkChainId, evmAddress, OrderDirection } from '@aave/client';
import { markets } from '@aave/client/actions';
import { useQueries } from '@tanstack/react-query';
import { client } from 'pages/_app.page';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

export type MeritAprByUnderlying = Map<string, { supplyApr: number; borrowApr: number }>;

const EMPTY_MAP: MeritAprByUnderlying = new Map();

type Incentive = {
  __typename?: string;
  userEligible?: boolean | null;
  extraSupplyApr?: { formatted: string } | null;
  borrowAprDiscount?: { formatted: string } | null;
  extraApr?: { formatted: string } | null;
};

const parseApr = (value?: { formatted: string } | null): number => {
  if (!value) return 0;
  const n = parseFloat(value.formatted);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Per-market query that resolves the SDK's `markets()` response and builds
 * a `Map<underlyingAddress, {supplyApr, borrowApr}>` of eligible Merit
 * APRs for the user. Entries are only present when the user passes the
 * backend's eligibility criteria for that reserve; missing keys mean "no
 * Merit contribution for this position".
 */
export const usePoolsMerits = (
  marketsData: MarketDataType[],
  userAddress?: string | null,
) => {
  const userAddr = userAddress ? evmAddress(userAddress) : undefined;

  return useQueries({
    queries: marketsData.map((marketData) => ({
      queryKey: [
        ...queryKeysFactory.market(marketData),
        ...queryKeysFactory.user(userAddr ?? 'anonymous'),
      ],
      enabled: !!client,
      queryFn: async (): Promise<MeritAprByUnderlying> => {
        const response = await markets(client, {
          chainIds: [sdkChainId(marketData.chainId)],
          user: userAddr,
          suppliesOrderBy: { tokenName: OrderDirection.Asc },
          borrowsOrderBy: { tokenName: OrderDirection.Asc },
        });
        if (response.isErr()) throw response.error;

        const map: MeritAprByUnderlying = new Map();
        for (const sdkMarket of response.value) {
          const allReserves = [
            ...(sdkMarket.supplyReserves ?? []),
            ...(sdkMarket.borrowReserves ?? []),
          ];
          for (const r of allReserves) {
            const underlying = r.underlyingToken.address.toLowerCase();
            const existing = map.get(underlying) ?? { supplyApr: 0, borrowApr: 0 };
            const incentives: Incentive[] = (r.incentives ?? []) as Incentive[];
            for (const inc of incentives) {
              if (!inc.userEligible) continue;
              if (inc.__typename === 'MeritSupplyIncentive') {
                existing.supplyApr += parseApr(inc.extraSupplyApr);
              } else if (inc.__typename === 'MeritBorrowIncentive') {
                existing.borrowApr += parseApr(inc.borrowAprDiscount);
              } else if (inc.__typename === 'MeritBorrowAndSupplyIncentiveCondition') {
                // Conditional reward: paid to both sides when the user
                // holds the specified collateral + debt simultaneously.
                const apr = parseApr(inc.extraApr);
                existing.supplyApr += apr;
                existing.borrowApr += apr;
              }
            }
            map.set(underlying, existing);
          }
        }
        return map;
      },
    })),
  });
};

export const emptyMeritMap = (): MeritAprByUnderlying => EMPTY_MAP;
