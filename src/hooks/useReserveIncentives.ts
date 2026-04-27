/**
 * Reserve-level incentives read through the V3 backend GraphQL API.
 *
 * Background: historically the interface pegged to Merkl, aavechan, and a
 * handful of hardcoded partner maps to render incentives on each reserve.
 * `aave-v3-backend` now centralizes those sources — Merit (legacy ACI),
 * governance-native Aave incentives, Aave-owned Merkl campaigns, and
 * points / loyalty programs (Aave Points, Tydro Ink, Ethena Rewards,
 * Ether.fi Loyalty) — behind `Reserve.incentives`. This hook reads
 * that union so downstream UI can render any variant.
 *
 * The 7 legacy hooks (`useMerklIncentives`, `useMerklPointsIncentives`,
 * `useMeritIncentives`, `useUserMeritIncentives`, `useEthenaIncentives`,
 * `useEtherfiIncentives`, `useSonicIncentives`) continue to work; they will
 * be migrated to derive from this hook in a follow-up PR.
 */
import { useQuery } from '@tanstack/react-query';
import { CustomMarket, marketsData } from 'src/ui-config/marketsConfig';

/**
 * Consumer code historically passes `currentMarket` — an internal slug like
 * `"proto_mainnet_v3"` — as `market`. The backend's `ReserveRequest.market`
 * field expects a V3 Pool address. Resolve the slug → address here so every
 * existing callsite keeps working while new callers can pass the address
 * directly.
 */
const resolveMarketAddress = (market: string): string => {
  if (market.startsWith('0x')) return market;
  const cfg = marketsData[market as CustomMarket];
  return cfg?.addresses?.LENDING_POOL ?? market;
};

const DEFAULT_ENDPOINT = 'https://api.v3.staging.aave.com/graphql';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_AAVE_V3_API_URL ?? DEFAULT_ENDPOINT;

/** Identifier for a reward program row in `aave-v3-backend`. UUID string. */
export type RewardId = string;

export type IncentiveCriteria = {
  __typename: 'IncentiveCriteria';
  id: string;
  text: string;
  userPassed: boolean;
};

export type PointsProgram = {
  __typename: 'PointsProgram';
  id: RewardId;
  name: string;
  externalUrl: string | null;
  iconUrl: string | null;
};

type PercentValue = {
  formatted: string;
  value: string;
};

type Currency = {
  address: string;
  chainId: number;
  symbol?: string;
};

// ----- Legacy variants (on-chain Merit + governance-native) ------------------

export type MeritSupplyIncentive = {
  __typename: 'MeritSupplyIncentive';
  extraSupplyApr: PercentValue;
  claimLink: string;
  actionKey?: string;
  rewardTokenAddress?: string;
  rewardTokenSymbol?: string;
  customMessage?: string | null;
  customForumLink?: string | null;
  selfApr?: PercentValue | null;
};

export type MeritBorrowIncentive = {
  __typename: 'MeritBorrowIncentive';
  borrowAprDiscount: PercentValue;
  claimLink: string;
  actionKey?: string;
  rewardTokenAddress?: string;
  rewardTokenSymbol?: string;
  customMessage?: string | null;
  customForumLink?: string | null;
  selfApr?: PercentValue | null;
};

export type MeritBorrowAndSupplyIncentiveCondition = {
  __typename: 'MeritBorrowAndSupplyIncentiveCondition';
  extraApr: PercentValue;
  supplyToken: Currency;
  borrowToken: Currency;
  claimLink: string;
  actionKey?: string;
  rewardTokenAddress?: string;
  rewardTokenSymbol?: string;
  customMessage?: string | null;
  customForumLink?: string | null;
  selfApr?: PercentValue | null;
};

export type AaveSupplyIncentive = {
  __typename: 'AaveSupplyIncentive';
  extraSupplyApr: PercentValue;
  rewardTokenAddress: string;
  rewardTokenSymbol: string;
};

export type AaveBorrowIncentive = {
  __typename: 'AaveBorrowIncentive';
  borrowAprDiscount: PercentValue;
  rewardTokenAddress: string;
  rewardTokenSymbol: string;
};

// ----- New variants (Aave-owned Merkl + points / partner loyalty programs) --

export type MerklSupplyIncentive = {
  __typename: 'MerklSupplyIncentive';
  id: RewardId;
  startDate: string;
  endDate: string;
  extraApy: PercentValue;
  payoutToken: Currency;
  criteria: IncentiveCriteria[];
  userEligible: boolean;
  description?: string | null;
  customMessage?: string | null;
  customForumLink?: string | null;
  customClaimMessage?: string | null;
};

export type MerklBorrowIncentive = {
  __typename: 'MerklBorrowIncentive';
  id: RewardId;
  startDate: string;
  endDate: string;
  discountApy: PercentValue;
  payoutToken: Currency;
  criteria: IncentiveCriteria[];
  userEligible: boolean;
  description?: string | null;
  customMessage?: string | null;
  customForumLink?: string | null;
  customClaimMessage?: string | null;
};

export type SupplyPointsIncentive = {
  __typename: 'SupplyPointsIncentive';
  id: RewardId;
  program: PointsProgram;
  name: string;
  startDate: string;
  endDate: string | null;
  multiplier: number;
  criteria: IncentiveCriteria[] | null;
  userEligible: boolean;
  dailyPoints?: number | null;
  pointsPerThousandUsd?: number | null;
  description?: string | null;
  customMessage?: string | null;
  customForumLink?: string | null;
};

export type BorrowPointsIncentive = {
  __typename: 'BorrowPointsIncentive';
  id: RewardId;
  program: PointsProgram;
  name: string;
  startDate: string;
  endDate: string | null;
  multiplier: number;
  criteria: IncentiveCriteria[] | null;
  userEligible: boolean;
  dailyPoints?: number | null;
  pointsPerThousandUsd?: number | null;
  description?: string | null;
  customMessage?: string | null;
  customForumLink?: string | null;
};

export type ReserveIncentive =
  | MeritSupplyIncentive
  | MeritBorrowIncentive
  | MeritBorrowAndSupplyIncentiveCondition
  | AaveSupplyIncentive
  | AaveBorrowIncentive
  | MerklSupplyIncentive
  | MerklBorrowIncentive
  | SupplyPointsIncentive
  | BorrowPointsIncentive;

const RESERVE_INCENTIVES_QUERY = `
  query ReserveIncentives($request: ReserveRequest!) {
    reserve(request: $request) {
      incentives {
        __typename
        ... on MeritSupplyIncentive {
          extraSupplyApr { formatted value }
          claimLink
          actionKey
          rewardTokenAddress
          rewardTokenSymbol
          customMessage
          customForumLink
          selfApr { formatted value }
        }
        ... on MeritBorrowIncentive {
          borrowAprDiscount { formatted value }
          claimLink
          actionKey
          rewardTokenAddress
          rewardTokenSymbol
          customMessage
          customForumLink
          selfApr { formatted value }
        }
        ... on MeritBorrowAndSupplyIncentiveCondition {
          extraApr { formatted value }
          supplyToken { address chainId }
          borrowToken { address chainId }
          claimLink
          actionKey
          rewardTokenAddress
          rewardTokenSymbol
          customMessage
          customForumLink
          selfApr { formatted value }
        }
        ... on AaveSupplyIncentive {
          extraSupplyApr { formatted value }
          rewardTokenAddress
          rewardTokenSymbol
        }
        ... on AaveBorrowIncentive {
          borrowAprDiscount { formatted value }
          rewardTokenAddress
          rewardTokenSymbol
        }
        ... on MerklSupplyIncentive {
          id
          startDate
          endDate
          extraApy { formatted value }
          payoutToken { address chainId symbol }
          criteria { id text userPassed }
          userEligible
          description
          customMessage
          customForumLink
          customClaimMessage
        }
        ... on MerklBorrowIncentive {
          id
          startDate
          endDate
          discountApy { formatted value }
          payoutToken { address chainId symbol }
          criteria { id text userPassed }
          userEligible
          description
          customMessage
          customForumLink
          customClaimMessage
        }
        ... on SupplyPointsIncentive {
          id
          program { id name externalUrl iconUrl }
          name
          startDate
          endDate
          multiplier
          criteria { id text userPassed }
          userEligible
          dailyPoints
          pointsPerThousandUsd
          description
          customMessage
          customForumLink
        }
        ... on BorrowPointsIncentive {
          id
          program { id name externalUrl iconUrl }
          name
          startDate
          endDate
          multiplier
          criteria { id text userPassed }
          userEligible
          dailyPoints
          pointsPerThousandUsd
          description
          customMessage
          customForumLink
        }
      }
    }
  }
`;

type ReserveIncentivesResponse = {
  data?: {
    reserve: { incentives: ReserveIncentive[] } | null;
  };
  errors?: Array<{ message: string }>;
};

export type UseReserveIncentivesArgs = {
  /** V3 Pool address for the market (e.g. `0x87870bca...` for Aave V3 Ethereum Core). */
  market: string;
  /** Underlying asset address. */
  underlying: string;
  chainId: number;
  /** Optional user address. When set, `userEligible` on each variant reflects
   *  the user's actual V3 positions. */
  user?: string;
  enabled?: boolean;
};

/**
 * Fetches the `ReserveIncentive` union for a specific reserve from the V3
 * backend. Returns an empty array if the reserve is not found or the backend
 * fails — upstream display code should tolerate missing variants gracefully.
 */
export const useReserveIncentives = ({
  market,
  underlying,
  chainId,
  user,
  enabled = true,
}: UseReserveIncentivesArgs) => {
  const marketAddress = resolveMarketAddress(market);
  return useQuery<ReserveIncentive[]>({
    queryKey: ['reserveIncentives', chainId, marketAddress, underlying, user ?? null],
    staleTime: 1000 * 60 * 5,
    enabled:
      enabled && Boolean(marketAddress && marketAddress.startsWith('0x') && underlying && chainId),
    queryFn: async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: RESERVE_INCENTIVES_QUERY,
          variables: {
            request: { market: marketAddress, underlyingToken: underlying, chainId, user },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Reserve incentives query failed: ${response.status}`);
      }

      const body = (await response.json()) as ReserveIncentivesResponse;

      if (body.errors?.length) {
        throw new Error(
          `Reserve incentives query returned errors: ${body.errors
            .map((e) => e.message)
            .join(', ')}`
        );
      }

      return body.data?.reserve?.incentives ?? [];
    },
  });
};
