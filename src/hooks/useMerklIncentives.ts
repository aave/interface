import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import {
  additionalIncentiveInfo,
  whitelistedRewardTokens,
} from '@aavechan/aave-merkl-token-whitelist';
import { useQuery } from '@tanstack/react-query';
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

type MerklOpportunity = {
  chainId: number;
  type: string;
  identifier: Address;
  name: string;
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
};

const hardcodedIncentives: Record<string, ExtendedReserveIncentiveResponse> = {};

const MERKL_ENDPOINT = 'https://api.merkl.xyz/v4/opportunities?mainProtocolId=aave'; // Merkl API

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
  return useQuery({
    queryFn: async () => {
      const response = await fetch(`${MERKL_ENDPOINT}`);
      const merklOpportunities: MerklOpportunity[] = await response.json();
      return merklOpportunities;
    },
    queryKey: ['merklIncentives', market],
    staleTime: 1000 * 60 * 5,
    select: (merklOpportunities) => {
      const hardcodedIncentive = rewardedAsset ? hardcodedIncentives[rewardedAsset] : undefined;

      if (hardcodedIncentive) {
        return hardcodedIncentive;
      }

      const opportunities = merklOpportunities.filter(
        (opportunitiy) =>
          rewardedAsset &&
          opportunitiy.explorerAddress &&
          opportunitiy.explorerAddress.toLowerCase() === rewardedAsset.toLowerCase() &&
          protocolAction &&
          checkOpportunityAction(opportunitiy.action, protocolAction)
      );

      if (opportunities.length === 0) {
        return null;
      }

      const opportunity = opportunities[0];

      if (opportunity.status !== OpportunityStatus.LIVE) {
        return null;
      }

      if (opportunity.apr <= 0) {
        return null;
      }

      const merklIncentivesAPR = opportunity.apr / 100;
      const merklIncentivesAPY = convertAprToApy(merklIncentivesAPR);

      const rewardToken = opportunity.rewardsRecord.breakdowns[0].token;

      if (!whitelistedRewardTokens.has(checksumAddress(rewardToken.address as Address))) {
        return null;
      }

      const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
        return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
      }, 0);

      const isBorrow = protocolAction === ProtocolAction.borrow;
      const totalAPY = isBorrow
        ? protocolAPY - protocolIncentivesAPR - merklIncentivesAPY
        : protocolAPY + protocolIncentivesAPR + merklIncentivesAPY;

      const incentiveAdditionalData = rewardedAsset
        ? additionalIncentiveInfo[checksumAddress(rewardedAsset as Address)]
        : undefined;

      return {
        incentiveAPR: merklIncentivesAPY.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
        ...incentiveAdditionalData,
        breakdown: {
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
        } as MerklIncentivesBreakdown,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
