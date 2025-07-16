import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Celo,
  AaveV3Ethereum,
  AaveV3EthereumEtherFi,
  AaveV3EthereumLido,
  AaveV3Gnosis,
  AaveV3Linea,
  AaveV3Metis,
  AaveV3Optimism,
  AaveV3Polygon,
  AaveV3Scroll,
  AaveV3Soneium,
  AaveV3Sonic,
} from '@bgd-labs/aave-address-book';
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

const allAaveAssets = [
  AaveV3Ethereum.ASSETS,
  AaveV3EthereumLido.ASSETS,
  AaveV3EthereumEtherFi.ASSETS,
  AaveV3Base.ASSETS,
  AaveV3Arbitrum.ASSETS,
  AaveV3Avalanche.ASSETS,
  AaveV3Sonic.ASSETS,
  AaveV3Optimism.ASSETS,
  AaveV3Polygon.ASSETS,
  AaveV3Metis.ASSETS,
  AaveV3Gnosis.ASSETS,
  AaveV3BNB.ASSETS,
  AaveV3Scroll.ASSETS,
  AaveV3Linea.ASSETS,
  AaveV3Celo.ASSETS,
  AaveV3Soneium.ASSETS,
];

const getUnderlyingAndAToken = (assets: {
  [key: string]: {
    UNDERLYING: Address;
    A_TOKEN: Address;
  };
}) => {
  return Object.entries(assets).flatMap(([, asset]) => [
    asset.UNDERLYING.toLowerCase(),
    asset.A_TOKEN.toLowerCase(),
  ]);
};

const otherTokensWhitelisted = [
  '0x04eadd7b10ea9a484c60860aea7a7c0aec09b9f0', // aUSDtb wrapper contract
];

const whitelistedRewardTokens = [
  ...allAaveAssets.flatMap((assets) => getUnderlyingAndAToken(assets)),
  ...otherTokensWhitelisted,
];

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
}: {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
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

      if (!whitelistedRewardTokens.includes(rewardToken.address.toLowerCase())) {
        return null;
      }

      return {
        incentiveAPR: apr.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
      } as ExtendedReserveIncentiveResponse;
    },
  });
};
