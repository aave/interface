import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';
import { Address, checksumAddress } from 'viem';

enum OpportunityAction {
  LEND = 'LEND',
  BORROW = 'BORROW',
}

enum OpportunityStatus {
  LIVE = 'LIVE',
  PAST = 'PAST',
  UPCOMING = 'UPCOMING',
}

export type MerklOpportunity = {
  chainId: number;
  type: string;
  description?: string;
  identifier: Address;
  name: string;
  depositUrl?: string;
  status: OpportunityStatus;
  action: OpportunityAction;
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: [];
  id: string;
  explorerAddress?: Address;
  tokens: {
    id: string;
    name: string;
    chainId: number;
    address: Address;
    decimals: number;
    icon: string;
    verified: boolean;
    isTest: boolean;
    price: number;
    symbol: string;
  }[];
  aprRecord: {
    cumulated: number;
    timestamp: string;
    breakdowns: {
      distributionType: string;
      identifier: string;
      type: string;
      value: number;
      timestamp: string;
    }[];
  };
  rewardsRecord: {
    id: string;
    total: number;
    timestamp: string;
    breakdowns: {
      token: {
        id: string;
        name: string;
        chainId: number;
        address: string;
        decimals: number;
        symbol: string;
        displaySymbol: string;
        icon: string;
        verified: boolean;
        isTest: boolean;
        type: string;
        isNative: boolean;
        price: number;
      };
      amount: string;
      value: number;
      distributionType: string;
      id: string;
      campaignId: string;
      dailyRewardsRecordId: string;
      onChainCampaignId: string;
    }[];
  };
};

type ReserveIncentiveAdditionalData = {
  customClaimMessage?: string;
  customMessage?: string;
  customForumLink?: string;
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse &
  ReserveIncentiveAdditionalData & {
    breakdown: MerklIncentivesBreakdown;
    description?: string;
    rewardsTokensMappedApys?: {
      token: {
        id: string;
        name: string;
        chainId: number;
        address: string;
        decimals: number;
        symbol: string;
        displaySymbol: string;
        icon: string;
        verified: boolean;
        isTest: boolean;
        type: string;
        isNative: boolean;
        price: number;
      };
      amount: string;
      value: number;
      distributionType: string;
      id: string;
      campaignId: string;
      dailyRewardsRecordId: string;
      onChainCampaignId: string;
      apy: number;
    }[];
  };

export type MerklIncentivesBreakdown = {
  protocolAPY: number;
  protocolIncentivesAPR: number;
  merklIncentivesAPR: number; // Now represents APY (converted from APR)
  totalAPY: number;
  isBorrow: boolean;
  breakdown: {
    protocol: number;
    protocolIncentives: number;
    merklIncentives: number; // Now represents APY (converted from APR)
  };
  points?: {
    dailyPoints: number;
    pointsPerThousandUsd: number;
  };
};
type WhitelistApiResponse = {
  whitelistedRewardTokens: string[];
  additionalIncentiveInfo: Record<string, ReserveIncentiveAdditionalData>;
};

const MERKL_ENDPOINT = 'https://api.merkl.xyz/v4/opportunities?mainProtocolId=aave'; // Merkl API
const WHITELIST_ENDPOINT = 'https://apps.aavechan.com/api/aave/merkl/whitelist-token-list'; // Endpoint to fetch whitelisted tokens
const checkOpportunityAction = (
  opportunityAction: OpportunityAction,
  protocolAction: ProtocolAction
) => {
  switch (opportunityAction) {
    case OpportunityAction.LEND:
      return protocolAction === ProtocolAction.supply;
    case OpportunityAction.BORROW:
      return protocolAction === ProtocolAction.borrow;
    default:
      return false;
  }
};
const useWhitelistedTokens = () => {
  return useQuery({
    queryFn: async (): Promise<WhitelistApiResponse> => {
      const response = await fetch(WHITELIST_ENDPOINT);
      if (!response.ok) {
        throw new Error('Failed to fetch whitelisted tokens');
      }
      return await response.json();
    },
    queryKey: ['whitelistedTokens'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMerklIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
  protocolAPY = 0,
  protocolIncentives = [],
}: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
}) => {
  const currentChainId = useRootStore((state) => state.currentChainId);
  const { data: whitelistData } = useWhitelistedTokens();

  return useQuery({
    queryFn: async () => {
      const response = await fetch(`${MERKL_ENDPOINT}`);
      const merklOpportunities: MerklOpportunity[] = await response.json();

      return merklOpportunities;
    },
    queryKey: ['merklIncentives', market],
    staleTime: 1000 * 60 * 5,
    select: (merklOpportunities) => {
      const opportunities = merklOpportunities.filter(
        (opportunitiy) =>
          rewardedAsset &&
          opportunitiy.explorerAddress &&
          opportunitiy.explorerAddress.toLowerCase() === rewardedAsset.toLowerCase() &&
          protocolAction &&
          checkOpportunityAction(opportunitiy.action, protocolAction) &&
          opportunitiy.chainId === currentChainId
      );

      if (opportunities.length === 0) {
        return null;
      }

      const validOpportunities = opportunities.filter(
        (opp) => opp.status === OpportunityStatus.LIVE && opp.apr > 0
      );

      if (!whitelistData?.whitelistedRewardTokens) {
        return null;
      }

      const whitelistedTokensSet = new Set(
        whitelistData.whitelistedRewardTokens.map((token) => token.toLowerCase())
      );

      const whitelistedOpportunities = validOpportunities.filter((opp) =>
        opp.rewardsRecord.breakdowns.some((breakdown) => {
          const rewardToken = breakdown.token;
          return rewardToken && whitelistedTokensSet.has(rewardToken.address.toLowerCase());
        })
      );

      if (whitelistedOpportunities.length === 0) {
        return null;
      }

      const totalMerklAPR = whitelistedOpportunities.reduce((sum, opp) => {
        return sum + opp.apr / 100;
      }, 0);

      const merklIncentivesAPY = convertAprToApy(totalMerklAPR);
      const aprsBreakdowns = whitelistedOpportunities.flatMap((opp) => opp.aprRecord.breakdowns);
      const breakdownTokens = whitelistedOpportunities.flatMap((opp) => {
        return opp.rewardsRecord.breakdowns;
      });

      const rewardsTokensMappedApys = aprsBreakdowns
        .map((aprBreakdown) => {
          const matchingReward = breakdownTokens.find((reward) => {
            const isWhitelisted = whitelistedTokensSet.has(reward.token.address.toLowerCase());
            return isWhitelisted && reward.onChainCampaignId === aprBreakdown.identifier;
          });
          if (matchingReward) {
            return {
              ...matchingReward,
              apy: convertAprToApy(aprBreakdown.value / 100),
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const primaryOpportunity = whitelistedOpportunities[0];
      const rewardToken = primaryOpportunity.rewardsRecord.breakdowns[0].token;
      const description = primaryOpportunity.description;
      const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
        return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
      }, 0);

      const protocolIncentivesAPY = convertAprToApy(protocolIncentivesAPR);

      const isBorrow = protocolAction === ProtocolAction.borrow;
      const totalAPY = isBorrow
        ? protocolAPY - protocolIncentivesAPY - merklIncentivesAPY
        : protocolAPY + protocolIncentivesAPY + merklIncentivesAPY;

      const incentiveKey = `${currentChainId}-${checksumAddress(rewardedAsset as Address)}`;
      const incentiveAdditionalData = whitelistData?.additionalIncentiveInfo?.[incentiveKey];

      return {
        incentiveAPR: merklIncentivesAPY.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
        description: description,
        ...incentiveAdditionalData,
        rewardsTokensMappedApys,
        breakdown: {
          protocolAPY,
          protocolIncentivesAPR: protocolIncentivesAPY,
          merklIncentivesAPR: merklIncentivesAPY,
          totalAPY,
          isBorrow,
          breakdown: {
            protocol: protocolAPY,
            protocolIncentives: protocolIncentivesAPY,
            merklIncentives: merklIncentivesAPY,
          },
        } as MerklIncentivesBreakdown,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
