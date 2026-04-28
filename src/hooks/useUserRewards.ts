/**
 * User-level Merkl claim data via the V3 backend's `userRewards` query.
 *
 * Canonical replacement for `useUserMeritIncentives` (which calls
 * `apps.aavechan.com/api/merit/aprs` — that endpoint dies when ACI leaves).
 * The backend consolidates Merkl-claimable amounts across legacy Merit,
 * Aave-owned campaigns, and third-party partner programs, then builds the
 * claim transaction against the Merkl distributor.
 *
 * The `rewardIds` filter on `UserRewardsFilter` scopes the claim to specific
 * Aave-owned programs — identical in effect to V4's `claimRewards(ids)`.
 */
import { useQuery } from '@tanstack/react-query';

import type { RewardId } from './useReserveIncentives';

const DEFAULT_ENDPOINT = 'https://api.v3.staging.aave.com/graphql';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_AAVE_V3_API_URL ?? DEFAULT_ENDPOINT;

type TokenAmount = {
  amount: { formatted: string; value: string };
  currency: { address: string; chainId: number };
  usd: string;
};

type Currency = { address: string; chainId: number };

type TransactionRequest = {
  to: string;
  from: string;
  data: string;
  value: string;
  chainId: number;
};

export type ClaimableReward = {
  __typename: 'ClaimableReward';
  currency: Currency;
  amount: TokenAmount;
};

export type UserRewards = {
  __typename: 'UserRewards';
  chain: number;
  claimable: ClaimableReward[];
  transaction: TransactionRequest;
};

export type UserRewardsFilter = {
  tokens?: string[];
  rewardIds?: RewardId[];
};

const USER_REWARDS_QUERY = `
  query UserRewards($request: UserRewardsRequest!) {
    userRewards(request: $request) {
      chain
      claimable {
        currency { address chainId }
        amount {
          amount { formatted value }
          currency { address chainId }
          usd
        }
      }
      transaction {
        to
        from
        data
        value
        chainId
      }
    }
  }
`;

type UserRewardsResponse = {
  data?: { userRewards: UserRewards | null };
  errors?: Array<{ message: string }>;
};

export type UseUserRewardsArgs = {
  user: string;
  chainId: number;
  filter?: UserRewardsFilter;
  enabled?: boolean;
};

export const useUserRewards = ({ user, chainId, filter, enabled = true }: UseUserRewardsArgs) => {
  return useQuery<UserRewards | null>({
    queryKey: ['userRewards', chainId, user, filter ?? null],
    staleTime: 1000 * 30,
    enabled: enabled && Boolean(user && chainId),
    queryFn: async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: USER_REWARDS_QUERY,
          variables: { request: { user, chainId, filter } },
        }),
      });

      if (!response.ok) {
        throw new Error(`userRewards query failed: ${response.status}`);
      }

      const body = (await response.json()) as UserRewardsResponse;

      if (body.errors?.length) {
        throw new Error(
          `userRewards query returned errors: ${body.errors.map((e) => e.message).join(', ')}`
        );
      }

      return body.data?.userRewards ?? null;
    },
  });
};
