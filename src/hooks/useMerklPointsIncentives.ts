import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';

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

// Hardcoded Merkl endpoint for INK/tydro incentives
const INK_POINT_TOKEN_ADDRESSES = ['0x40aBd730Cc9dA34a8EE9823fEaBDBa35E50c4ac7'];
const MERKL_TYDRO_ENDPOINT =
  'https://api.merkl.xyz/v4/opportunities?mainProtocolId=tydro&chainName=ink'; // Merkl API

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
        if (!rewardedAsset || !opportunity.explorerAddress || !protocolAction) {
          return false;
        }
        const matchingToken = opportunity.tokens.find(
          (token) => token.address.toLowerCase() === rewardedAsset.toLowerCase()
        );

        return (
          matchingToken &&
          checkOpportunityAction(opportunity.action, protocolAction) &&
          opportunity.chainId === currentChainId
        );
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

      const protocolIncentivesAPY = convertAprToApy(protocolIncentivesAPR);

      const isBorrow = protocolAction === ProtocolAction.borrow;
      const totalAPY = isBorrow
        ? protocolAPY - protocolIncentivesAPY - merklIncentivesAPY
        : protocolAPY + protocolIncentivesAPY + merklIncentivesAPY;

      const incentiveAdditionalData: ReserveIncentiveAdditionalData = {
        customMessage: opportunity.description,
        customForumLink: opportunity.depositUrl,
      };

      const dailyPoints = Number(rewardsBreakdown.value);
      const tvl = Number(opportunity.tvl) || 0;
      const pointsPerThousandUsd = tvl > 0 ? (dailyPoints / tvl) * 1000 : 0;

      const breakdown: MerklIncentivesBreakdown = {
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
