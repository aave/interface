import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

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
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  customMessage: string;
  customForumLink: string;
};

const url = 'https://api.merkl.xyz/v4/opportunities?mainProtocolId=aave'; // Merkl API for ZK Ignite opportunities

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
export const useZkSyncIgniteIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
}: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
}) => {
  return useMerklIgniteIncentives({
    market,
    rewardedAsset,
    protocolAction,
    urlParams: `&tags=zksync`,
  });
};

export const useMerklIgniteIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
  urlParams = '',
}: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  urlParams?: string;
}) => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(`${url}${urlParams}`);
      const merklOpportunities: MerklOpportunity[] = await response.json();
      return merklOpportunities;
    },
    queryKey: ['merklIncentives', market],
    staleTime: 1000 * 60 * 5,
    select: (merklOpportunities) => {
      const opportunities = merklOpportunities.filter(
        (opportunitiy) =>
          rewardedAsset &&
          opportunitiy.identifier.toLowerCase() === rewardedAsset.toLowerCase() &&
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

      const apr = opportunity.apr / 100;

      const rewardToken = opportunity.tokens[opportunity.tokens.length - 1];

      return {
        incentiveAPR: apr.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
