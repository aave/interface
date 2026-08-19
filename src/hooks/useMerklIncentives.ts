import { ProtocolAction } from '@aave/contract-helpers';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { EXTRA_WHITELIST_TOKENS } from 'src/ui-config/merklConfig';
import { convertAprToApy } from 'src/utils/utils';
import { type Address, checksumAddress } from 'viem';

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
  balanceCampaignMessage?: string;
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse &
  ReserveIncentiveAdditionalData & {
    breakdown: MerklIncentivesBreakdown;
    description?: string;
    isSelf?: boolean;
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
      apr: number;
      apy: number;
      isBalanceCampaign: boolean;
    }[];
    hasBalanceCampaign?: boolean;
    balanceCampaignAPY?: number;
  };

export type MerklIncentivesBreakdown = {
  protocolAPY: number;
  protocolIncentivesAPR: number;
  merklIncentivesAPR: number; // Now represents APY (converted from APR)
  // Extra APY from balance-based campaigns. Deliberately excluded from
  // `merklIncentivesAPR` and `totalAPY`: only positions above the campaign's minimum
  // size earn it, so it must not inflate the headline APY.
  balanceCampaignAPY: number;
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

const MERKL_ENDPOINT =
  'https://api.merkl.xyz/v4/opportunities?mainProtocolId=aave&items=100&status=LIVE'; // Merkl API
const AAVE_NET_APR_DISTRIBUTION_TYPE = 'AAVE_NET_APR';
const convertApyToApr = (apy: number) => 12 * ((1 + apy) ** (1 / 12) - 1);

const getCampaignIncentiveApr = ({
  targetAprPercent,
  distributionType,
  protocolAction,
  baseProtocolApy,
}: {
  targetAprPercent: number;
  distributionType?: string;
  protocolAction?: ProtocolAction;
  baseProtocolApy: number;
}) => {
  const campaignApr = targetAprPercent / 100;

  if (distributionType !== AAVE_NET_APR_DISTRIBUTION_TYPE) {
    return campaignApr;
  }

  // For net APR campaigns, derive incentive delta in APY so:
  // supply => base APY + reward APY = target APY
  // borrow => base APY - reward APY = target APY
  // Then convert delta APY back to APR to keep the existing global APR pipeline unchanged.
  const targetApy = convertAprToApy(campaignApr);
  const targetMinusBase = targetApy - baseProtocolApy;

  if (protocolAction === ProtocolAction.borrow) {
    return convertApyToApr(Math.max(-targetMinusBase, 0));
  }

  return convertApyToApr(Math.max(targetMinusBase, 0));
};
const isSelfOpportunity = (opp: MerklOpportunity) =>
  opp.identifier?.toUpperCase().endsWith('SELF_VERIFICATION');

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
  const currentChainId = useRootStore((state) => state.currentChainId);

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

      if (!EXTRA_WHITELIST_TOKENS?.whitelistedRewardTokens) {
        return null;
      }

      const balanceCampaignTokensSet = new Set(
        (EXTRA_WHITELIST_TOKENS.balanceCampaignRewardTokens ?? [])
          .filter(Boolean)
          .map((token) => token.toLowerCase())
      );

      // Balance campaign payout tokens are whitelisted implicitly: listing them once in
      // `balanceCampaignRewardTokens` is enough. Keeping them out of the whitelist would
      // count their APR in the total with no row to explain it.
      const whitelistedTokensSet = new Set(
        [
          ...EXTRA_WHITELIST_TOKENS.whitelistedRewardTokens.map((token) => token.toLowerCase()),
          ...balanceCampaignTokensSet,
        ].filter(Boolean)
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
        const oppApr = opp.aprRecord.breakdowns.reduce((breakdownSum, breakdown) => {
          return (
            breakdownSum +
            getCampaignIncentiveApr({
              targetAprPercent: breakdown.value,
              distributionType: breakdown.distributionType,
              protocolAction,
              baseProtocolApy: protocolAPY,
            })
          );
        }, 0);

        return sum + oppApr;
      }, 0);

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
            const apr = getCampaignIncentiveApr({
              targetAprPercent: aprBreakdown.value,
              distributionType: aprBreakdown.distributionType,
              protocolAction,
              baseProtocolApy: protocolAPY,
            });

            return {
              ...matchingReward,
              apr,
              apy: convertAprToApy(apr),
              isBalanceCampaign: balanceCampaignTokensSet.has(
                matchingReward.token.address.toLowerCase()
              ),
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Balance-based campaigns pay out through a dedicated wrapper token, so their
      // tranche is carved out of the total and surfaced separately: the headline APY must
      // only include what every position earns.
      const balanceCampaignRewards = rewardsTokensMappedApys.filter(
        (reward) => reward.isBalanceCampaign
      );
      const balanceCampaignAPR = balanceCampaignRewards.reduce(
        (sum, reward) => sum + reward.apr,
        0
      );
      const balanceCampaignAPY = balanceCampaignRewards.reduce(
        (sum, reward) => sum + reward.apy,
        0
      );
      const hasBalanceCampaign = balanceCampaignRewards.length > 0;
      const merklIncentivesAPY = convertAprToApy(Math.max(totalMerklAPR - balanceCampaignAPR, 0));

      const primaryOpportunity = whitelistedOpportunities[0];
      const isSelf = whitelistedOpportunities.some(isSelfOpportunity);
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
      const incentiveAdditionalData =
        EXTRA_WHITELIST_TOKENS?.additionalIncentiveInfo?.[incentiveKey];

      return {
        incentiveAPR: merklIncentivesAPY.toString(),
        rewardTokenAddress: rewardToken.address,
        rewardTokenSymbol: rewardToken.symbol,
        description: description,
        ...incentiveAdditionalData,
        isSelf,
        rewardsTokensMappedApys,
        hasBalanceCampaign,
        balanceCampaignAPY,
        breakdown: {
          protocolAPY,
          protocolIncentivesAPR: protocolIncentivesAPY,
          merklIncentivesAPR: merklIncentivesAPY,
          balanceCampaignAPY,
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
