import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import { useMemo } from 'react';

/**
 * The Aave V4 API. The migration queries live on the V3 API and only describe a target by its
 * spoke, so everything else a hub card shows is read from here.
 */
const V4_API_URL = process.env.NEXT_PUBLIC_AAVE_V4_API_URL || 'https://api.aave.com/v4/graphql';

const RESERVES_QUERY = gql`
  query V4Reserves($request: ReservesRequest!) {
    reserves(request: $request) {
      id
      onChainId
      spoke {
        address
        name
      }
      canSupply
      canUseAsCollateral
      settings {
        collateral
        collateralFactor {
          value
        }
      }
      summary {
        supplied {
          exchange {
            value
          }
        }
        supplyApy {
          value
        }
        trailingSupplyApy(window: LAST_WEEK, includeRewards: true) {
          value
        }
        rewards {
          __typename
          ... on MerklSupplyReward {
            startDate
            endDate
          }
          ... on SupplyPointsReward {
            startDate
            endDate
          }
        }
      }
      asset {
        id
        underlying {
          address
          info {
            symbol
            name
          }
        }
        summary {
          supplied {
            exchange {
              value
            }
          }
        }
        hub {
          id
          name
          externalCurator {
            name
            icon
          }
        }
      }
    }
  }
`;

const SUPPLY_APY_HISTORY_QUERY = gql`
  query V4SupplyApyHistory($request: SupplyApyHistoryRequest!) {
    supplyApyHistory(request: $request) {
      date
      avgRate {
        value
      }
    }
  }
`;

interface Value {
  value: string;
}

/** The dates are only asked for on the supply side, the one an earn position is paid on. */
interface RewardResponse {
  __typename: string;
  startDate?: string;
  endDate?: string | null;
}

const SUPPLY_REWARDS = ['MerklSupplyReward', 'SupplyPointsReward'];

/** A campaign that pays suppliers and is running now, which is what Aave Pro marks a reserve for. */
const isActiveSupplyReward = ({ __typename, startDate, endDate }: RewardResponse, now: number) =>
  SUPPLY_REWARDS.includes(__typename) &&
  (!startDate || Date.parse(startDate) <= now) &&
  (!endDate || Date.parse(endDate) >= now);

type ReserveResponse = ReservesResponse['reserves'][number];

interface ReservesResponse {
  reserves: Array<{
    id: string;
    onChainId: string;
    spoke: { address: string; name: string };
    canSupply: boolean;
    canUseAsCollateral: boolean;
    settings: { collateral: boolean; collateralFactor: Value };
    summary: {
      supplied: { exchange: Value };
      supplyApy: Value;
      trailingSupplyApy: Value;
      rewards: RewardResponse[];
    };
    asset: {
      id: string;
      underlying: { address: string; info: { symbol: string; name: string } };
      // The API leaves the value out for a token it has no price for yet.
      summary: { supplied: { exchange: Value | null } };
      hub: {
        id: string;
        name: string;
        externalCurator: { name: string; icon: string } | null;
      };
    };
  }>;
}

interface SupplyApyHistoryResponse {
  supplyApyHistory: Array<{ date: string; avgRate: Value }>;
}

export interface V4ExposureAsset {
  symbol: string;
  name: string;
  address: string;
  /** This asset's part of what the hub's collateral assets hold, 0 to 1. */
  share: number;
}

export interface V4SupplyReserve {
  /** The V4 API's reserve id, as `useV4SupplyApyHistory` takes it. */
  id: string;
  /** The reserve's number on its spoke. */
  onChainId: number;
  /** The underlying token's address. */
  token: string;
  spokeAddress: string;
  spokeName: string;
  hubId: string;
  hubName: string;
  /** Missing when the hub is not run by an external curator. */
  curator?: { name: string; icon: string };
  canSupply: boolean;
  canUseAsCollateral: boolean;
  /** 0 to 1. */
  collateralFactor: number;
  /** 0.05 is 5%. */
  supplyApy: number;
  /** Average supply APY over the last 7 days, with the rewards paid to suppliers, as Aave Pro shows it. */
  supplyApyAverage: number;
  /** A campaign is paying suppliers of this reserve right now. */
  hasIncentives: boolean;
  /** Supplied to this reserve alone. */
  suppliedUSD: number;
  /** The assets that can back debt on the reserve's hub, the most supplied first. */
  exposure: V4ExposureAsset[];
}

/**
 * Each hub's collateral assets, as Aave Pro lists them: an asset counts when at least one of the
 * hub's reserves takes it as collateral, and weighs what the hub holds of it. The API's own
 * `Hub.exposure` is not used, as it also counts assets that are flagged but can back no debt.
 */
const toHubExposures = (reserves: ReserveResponse[]) => {
  const assetsByHub = new Map<string, Map<string, ReserveResponse['asset']>>();
  for (const { asset, settings } of reserves) {
    if (!settings.collateral || !asset.summary.supplied.exchange) continue;
    const assets = assetsByHub.get(asset.hub.id) ?? new Map<string, ReserveResponse['asset']>();
    assets.set(asset.id, asset);
    assetsByHub.set(asset.hub.id, assets);
  }

  const exposures = new Map<string, V4ExposureAsset[]>();
  for (const [hubId, assets] of assetsByHub) {
    const held = Array.from(assets.values(), (asset) => ({
      asset,
      usd: Number(asset.summary.supplied.exchange?.value ?? 0),
    }));
    const total = held.reduce((sum, { usd }) => sum + usd, 0);
    exposures.set(
      hubId,
      held
        .sort((a, b) => b.usd - a.usd)
        .map(({ asset, usd }) => ({
          symbol: asset.underlying.info.symbol,
          name: asset.underlying.info.name,
          address: asset.underlying.address,
          share: total > 0 ? usd / total : 0,
        }))
    );
  }
  return exposures;
};

/** Every reserve, each with its hub's collateral assets. */
const toReserves = ({ reserves }: ReservesResponse): V4SupplyReserve[] => {
  const exposures = toHubExposures(reserves);
  const now = Date.now();

  return reserves.map(
    ({ id, onChainId, spoke, canSupply, canUseAsCollateral, settings, summary, asset }) => ({
      id,
      onChainId: Number(onChainId),
      token: asset.underlying.address,
      spokeAddress: spoke.address,
      spokeName: spoke.name,
      hubId: asset.hub.id,
      hubName: asset.hub.name,
      curator: asset.hub.externalCurator ?? undefined,
      canSupply,
      canUseAsCollateral,
      collateralFactor: Number(settings.collateralFactor.value),
      supplyApy: Number(summary.supplyApy.value),
      supplyApyAverage: Number(summary.trailingSupplyApy.value),
      hasIncentives: summary.rewards.some((reward) => isActiveSupplyReward(reward, now)),
      suppliedUSD: Number(summary.supplied.exchange.value),
      exposure: exposures.get(asset.hub.id) ?? [],
    })
  );
};

/**
 * Every V4 reserve on `chainId`, fetched once for all tokens: a hub's collateral assets can only
 * be told from all of its reserves.
 */
export const useV4Reserves = (chainId: number | undefined) =>
  useQuery({
    queryKey: ['v4', 'reserves', chainId],
    queryFn: ({ signal }) =>
      request<ReservesResponse>({
        url: V4_API_URL,
        document: RESERVES_QUERY,
        variables: { request: { query: { chainIds: [chainId] }, filter: 'ALL' } },
        signal,
      }),
    enabled: chainId !== undefined,
    staleTime: 60_000,
    select: toReserves,
  });

const sameAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * The V4 reserves on `chainId` that take `token` as a supply. Join them to a migration target on
 * the spoke address with `findV4Reserve`.
 */
export const useV4SupplyReserves = (chainId: number | undefined, token: string | undefined) => {
  const query = useV4Reserves(chainId);

  const data = useMemo(
    () =>
      token
        ? query.data?.filter((reserve) => reserve.canSupply && sameAddress(reserve.token, token))
        : undefined,
    [query.data, token]
  );

  return { data, isLoading: query.isLoading || (!token && !query.isError) };
};

/**
 * The reserve a migration to `spokeAddress` lands in. A spoke can list an asset through more than
 * one hub; the migration API then takes the reserve with the lowest on-chain id, and so do we.
 */
export const findV4Reserve = (
  reserves: V4SupplyReserve[] | undefined,
  spokeAddress: string,
  /** Needed when `reserves` holds more than one token's. */
  token?: string
) =>
  reserves
    ?.filter(
      (reserve) =>
        sameAddress(reserve.spokeAddress, spokeAddress) &&
        (!token || sameAddress(reserve.token, token))
    )
    .reduce<V4SupplyReserve | undefined>(
      (lowest, reserve) => (lowest && lowest.onChainId <= reserve.onChainId ? lowest : reserve),
      undefined
    );

export interface V4ApySample {
  date: Date;
  /** 0.05 is 5%. */
  value: number;
}

const toApySamples = ({ supplyApyHistory }: SupplyApyHistoryResponse): V4ApySample[] =>
  supplyApyHistory.map(({ date, avgRate }) => ({
    date: new Date(date),
    value: Number(avgRate.value),
  }));

/** A reserve's supply APY over the last 7 days, rewards included, oldest first. */
export const useV4SupplyApyHistory = (reserveId: string | undefined) =>
  useQuery({
    queryKey: ['v4', 'supplyApyHistory', reserveId],
    queryFn: ({ signal }) =>
      request<SupplyApyHistoryResponse>({
        url: V4_API_URL,
        document: SUPPLY_APY_HISTORY_QUERY,
        variables: { request: { reserve: reserveId, window: 'LAST_WEEK', includeRewards: true } },
        signal,
      }),
    enabled: !!reserveId,
    staleTime: 5 * 60_000,
    select: toApySamples,
  });
