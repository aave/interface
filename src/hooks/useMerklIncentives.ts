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
import { convertAprToApy } from 'src/utils/utils';
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

const additionalIncentiveData: Record<string, ReserveIncentiveAdditionalData> = {
  [AaveV3Ethereum.ASSETS.USDe.A_TOKEN]: {
    customMessage:
      'You must supply USDe and hold an equal or greater amount of sUSDe (by USD value) to receive the incentives. To be eligible, your assets supplied must be at least 2x your account equity, and you must not be borrowing any USDe. The rate provided to eligible users will change week by week, but will be roughly in line with the sUSDe rate for the forseeable future.',
  },
  [AaveV3Ethereum.ASSETS.USDtb.A_TOKEN]: {
    customMessage:
      'You must supply USDtb to receive incentives. To be eligible, you must not be borrowing any USDtb.',
    customClaimMessage: 'Rewards will be claimable starting in early August.',
    customForumLink: 'https://x.com/ethena_labs/status/1950194502192550149',
  },
};

const hardcodedIncentives: Record<string, ExtendedReserveIncentiveResponse> = {};

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
  '0x3a4de44b29995a3d8cd02d46243e1563e55bcc8b', // Aave Ethereum USDe (wrapped)
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

      if (!whitelistedRewardTokens.includes(rewardToken.address.toLowerCase())) {
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
        ? additionalIncentiveData[rewardedAsset]
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
