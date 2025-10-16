import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { Address, checksumAddress } from 'viem';

import {
  ExtendedReserveIncentiveResponse,
  MerklIncentivesBreakdown,
  MerklOpportunity,
} from './useMerklIncentives';

enum OpportunityAction {
  LEND = 'LEND',
  BORROW = 'BORROW',
}

enum OpportunityStatus {
  LIVE = 'LIVE',
  PAST = 'PAST',
  UPCOMING = 'UPCOMING',
}

type ReserveIncentiveAdditionalData = {
  customClaimMessage?: string;
  customMessage?: string;
  customForumLink?: string;
};

type WhitelistApiResponse = {
  whitelistedRewardTokens: string[];
  additionalIncentiveInfo: Record<string, ReserveIncentiveAdditionalData>;
};
// Hardcoded Merkl endpoint for INK/tydro incentives
const INK_POINT_TOKEN_ADDRESSES = ['0x40aBd730Cc9dA34a8EE9823fEaBDBa35E50c4ac7'];
const MERKL_TYDRO_ENDPOINT =
  'https://api.merkl.xyz/v4/opportunities?mainProtocolId=tydro&chainName=ink'; // Merkl API
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
      return response.json();
    },
    queryKey: ['whitelistedTokens'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMerklPointsIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
  protocolAPY = 0,
  protocolIncentives = [],
  enabled = true,
}: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
  enabled?: boolean;
}) => {
  const currentChainId = useRootStore((state) => state.currentChainId);
  const { data: whitelistData } = useWhitelistedTokens();

  return useQuery({
    queryFn: async () => {
      const response = await fetch(`${MERKL_TYDRO_ENDPOINT}`);
      const merklOpportunities: MerklOpportunity[] = await response.json();
      return merklOpportunities;
    },
    queryKey: ['merklPointsIncentives', market, rewardedAsset, protocolAction],
    staleTime: 1000 * 60 * 5,
    enabled,
    select: (merklOpportunities) => {
      const opportunities = merklOpportunities.filter((opportunity) => {
        if (!rewardedAsset) {
          return false;
        }

        if (!opportunity.explorerAddress) {
          return false;
        }

        const matchingToken = opportunity.tokens.find(
          (token) => token.address.toLowerCase() === rewardedAsset.toLowerCase()
        );

        if (!matchingToken) {
          return false;
        }

        if (!protocolAction) {
          return false;
        }

        const actionMatch = checkOpportunityAction(opportunity.action, protocolAction);
        if (!actionMatch) {
          return false;
        }

        const chainMatch = opportunity.chainId === currentChainId;
        if (!chainMatch) {
          return false;
        }

        return true;
      });

      if (opportunities.length === 0) {
        return null;
      }

      const opportunity = opportunities[0];

      const rewardsBreakdown = opportunity.rewardsRecord.breakdowns[0];

      if (!rewardsBreakdown) {
        return null;
      }

      if (opportunity.status !== OpportunityStatus.LIVE) {
        return null;
      }

      // APR for this kind of campaign is always 0, as it's point-based
      const merklIncentivesAPY = 0;

      const rewardToken = rewardsBreakdown.token;

      if (!INK_POINT_TOKEN_ADDRESSES.includes(rewardToken.address)) {
        return null;
      }

      const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
        return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
      }, 0);

      const isBorrow = protocolAction === ProtocolAction.borrow;
      const totalAPY = isBorrow
        ? protocolAPY - protocolIncentivesAPR - merklIncentivesAPY
        : protocolAPY + protocolIncentivesAPR + merklIncentivesAPY;

      const incentiveKey = `${currentChainId}-${checksumAddress(rewardedAsset as Address)}`;
      const incentiveAdditionalData = whitelistData?.additionalIncentiveInfo?.[incentiveKey];

      const dailyPoints = Number(rewardsBreakdown.value);
      const tvl = Number(opportunity.tvl) || 0;
      const pointsPerThousandUsd = tvl > 0 ? (dailyPoints / tvl) * 1000 : 0;

      const breakdown: MerklIncentivesBreakdown = {
        protocolAPY,
        protocolIncentivesAPR,
        merklIncentivesAPR: merklIncentivesAPY,
        totalAPY,
        isBorrow,
        breakdown: {
          protocol: protocolAPY,
          protocolIncentives: protocolIncentivesAPR,
          merklIncentives: merklIncentivesAPY,
        },
        points: {
          dailyPoints,
          pointsPerThousandUsd,
        },
      };

      return {
        incentiveAPR: merklIncentivesAPY.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
        ...incentiveAdditionalData,
        breakdown: breakdown,
        points: { dailyPoints, pointsPerThousandUsd },
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
