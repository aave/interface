import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3ZkSync } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

enum Action {
  LEND = 'LEND',
  BORROW = 'BORROW',
}

enum Status {
  LIVE = 'LIVE',
  PAST = 'PAST',
  UPCOMING = 'UPCOMING',
}

type MerklOpportunity = {
  chainId: number;
  type: string;
  identifier: Address;
  name: string;
  status: Status;
  action: Action;
  tvl: number;
  apr: number;
  dailyRewards: number;
  tags: [];
  id: string;
  tokens: [
    {
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
    }
  ];
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  customMessage: string;
  customForumLink: string;
};

const url =
  'https://api.merkl.xyz/v4/opportunities?items=50&test=true&tags=zksync&mainProtocolId=aave'; // Merkl API for ZK Ignite opportunities

const rewardToken = AaveV3ZkSync.ASSETS.ZK.UNDERLYING;
const rewardTokenSymbol = 'ZK';

export const useZkSyncIgniteIncentives = ({ asset }: { asset?: string }) => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const merklOpportunities: MerklOpportunity[] = await response.json();

      console.log('MerklOpportunities', merklOpportunities);

      return merklOpportunities;
    },
    queryKey: ['zkIgniteIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (merklOpportunities) => {
      console.log(merklOpportunities.map((opportunity) => opportunity.identifier));
      console.log('asset', asset);

      const opportunities = merklOpportunities.filter(
        (opportunitiy) => opportunitiy.identifier.toLowerCase() === asset?.toLowerCase()
      );

      console.log('opportunities', opportunities);

      if (opportunities.length === 0) {
        return null;
      }

      const opportunity = opportunities[0];

      if (opportunity.status !== Status.LIVE) {
        return null;
      }

      const apr = opportunity.apr / 100;

      console.log({
        incentiveAPR: apr.toString(),
        rewardTokenAddress: rewardToken,
        rewardTokenSymbol: rewardTokenSymbol,
      });

      return {
        incentiveAPR: apr.toString(),
        rewardTokenAddress: rewardToken,
        rewardTokenSymbol: rewardTokenSymbol,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
