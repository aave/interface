import { useQuery } from '@tanstack/react-query';

const DEFAULT_ENDPOINT = 'https://api.v3.staging.aave.com/graphql';
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_AAVE_V3_API_URL ?? DEFAULT_ENDPOINT;
const MAINNET_CHAIN_ID = 1;

type PercentValue = {
  decimals: number;
  formatted: string;
  raw: string;
  value: string;
};

export type MeritSavingsGhoIncentive = {
  __typename: 'MeritSavingsGhoIncentive';
  actionKey?: string | null;
  apr: PercentValue;
  claimLink: string;
  customForumLink?: string | null;
  customMessage?: string | null;
  rewardTokenAddress?: string | null;
  rewardTokenSymbol?: string | null;
};

type SavingsGhoIncentiveResponse = {
  data?: {
    savingsGhoIncentive?: MeritSavingsGhoIncentive | null;
  };
  errors?: { message: string }[];
};

export type SavingsGhoAprData = MeritSavingsGhoIncentive & {
  aprDecimal: string;
  aprPercentage: number;
};

type UseSavingsGhoIncentiveArgs = {
  chainId?: number;
  enabled?: boolean;
};

const SAVINGS_GHO_INCENTIVE_QUERY = `
  query SavingsGhoIncentive($chainId: ChainId) {
    savingsGhoIncentive(chainId: $chainId) {
      __typename
      actionKey
      apr {
        decimals
        formatted
        raw
        value
      }
      claimLink
      customForumLink
      customMessage
      rewardTokenAddress
      rewardTokenSymbol
    }
  }
`;

export const useSavingsGhoIncentive = ({
  chainId = MAINNET_CHAIN_ID,
  enabled = true,
}: UseSavingsGhoIncentiveArgs = {}) => {
  return useQuery<SavingsGhoAprData | null>({
    queryKey: ['savingsGhoIncentive', chainId],
    staleTime: 1000 * 60 * 5,
    enabled: enabled && Boolean(chainId),
    queryFn: async () => {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: SAVINGS_GHO_INCENTIVE_QUERY,
          variables: { chainId },
        }),
      });

      if (!response.ok) {
        throw new Error(`Savings GHO incentive query failed: ${response.status}`);
      }

      const body = (await response.json()) as SavingsGhoIncentiveResponse;

      if (body.errors?.length) {
        throw new Error(
          `Savings GHO incentive query returned errors: ${body.errors
            .map((e) => e.message)
            .join(', ')}`
        );
      }

      const incentive = body.data?.savingsGhoIncentive;
      if (!incentive) {
        return null;
      }

      const aprDecimal = incentive.apr.value;
      const aprPercentage = parseFloat(aprDecimal) * 100;

      if (!Number.isFinite(aprPercentage) || aprPercentage <= 0) {
        return null;
      }

      return {
        ...incentive,
        aprDecimal,
        aprPercentage,
      };
    },
  });
};
