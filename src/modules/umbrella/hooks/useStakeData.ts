import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { HookOpts } from 'src/hooks/commonTypes';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { Rewards, StakeData, StakeUserData } from '../services/StakeDataProviderService';

export const selectStakeDataByAddress = (stakeData: StakeData[], address: string) =>
  stakeData.find((elem) => elem.stakeToken === address);
export const selectUserStakeDataByAddress = (stakeData: StakeUserData[], address: string) =>
  stakeData.find((elem) => elem.stakeToken === address);

export const useStakeData = <T = StakeData[]>(
  marketData: MarketDataType,
  opts?: HookOpts<StakeData[], T>
) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getStakeData(marketData);
    },
    queryKey: ['getStkTokens', marketData.marketTitle],
    ...opts,
  });
};

export const useUserStakeData = <T = StakeUserData[]>(
  marketData: MarketDataType,
  opts?: HookOpts<StakeUserData[], T>
) => {
  const { stakeDataService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: () => {
      return stakeDataService.getUserTakeData(marketData, user);
    },
    queryKey: ['getUserStakeData', marketData.marketTitle, user],
    enabled: !!user,
    ...opts,
  });
};

// export interface MergedStakeData extends StakeData {
//   balances: StakeUserBalances;
//   cooldownData: StakeUserCooldown;
//   name: string;
//   symbol: string;
//   decimals: number;
//   priceInUSD: string;
//   iconSymbol: string;
// }

// export const useMergedStakeData = (
//   stakingData: StakeData[],
//   userStakeToken: StakeUserData[],
//   reserveData: ComputedReserveData[]
// ): MergedStakeData[] => {
//   return useMemo(() => {
//     if (
//       !Array.isArray(stakingData) ||
//       !Array.isArray(userStakeToken) ||
//       !Array.isArray(reserveData)
//     ) {
//       return [];
//     }

//     if (!stakingData.length || !userStakeToken.length || !reserveData.length) {
//       return [];
//     }

//     const mergedData = stakingData.reduce<MergedStakeData[]>((acc, stakeItem) => {
//       const matchingBalance = userStakeToken.find(
//         (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.stakeToken.toLowerCase()
//       );

//       const matchingReserve = reserveData.find(
//         (reserveItem) =>
//           reserveItem.underlyingAsset.toLowerCase() ===
//           stakeItem.waTokenData.waTokenUnderlying.toLowerCase()
//       );

//       if (!matchingBalance || !matchingReserve) {
//         return acc;
//       }

//       acc.push({
//         ...stakeItem,
//         balances: matchingBalance.balances,
//         cooldownData: matchingBalance.cooldown,
//         name: matchingReserve.name,
//         symbol: matchingReserve.symbol,
//         decimals: matchingReserve.decimals,
//         priceInUSD: matchingReserve.priceInUSD || '0',
//         iconSymbol: matchingReserve.iconSymbol || 'USDC',
//       });

//       return acc;
//     }, []);

//     return mergedData;
//   }, [stakingData, userStakeToken, reserveData]);
// };

export const useRewardsApy = (rewards: Rewards[]) => {
  return useMemo(() => {
    if (!rewards.length || rewards[0].currentEmissionPerSecond === '0') {
      return '0';
    }

    const now = Math.floor(Date.now() / 1000);
    if (Number(rewards[0].distributionEnd) < now) {
      return '0';
    }

    return rewards[0].apy;
  }, [rewards]);
};

// TODO LINT
// export const useStakedDataWithTokenBalances = (userStakeData, chainId, user) => {
//   return useQuery({
//     queryKey: ['stakedDataWithTokenBalances', chainId, user, userStakeData],
//     enabled: !!userStakeData && userStakeData.length > 0,
//     queryFn: async () => {
//       const provider = getProvider(chainId);
//       const multicall = new Multicall({
//         ethersProvider: provider,
//         tryAggregate: true,
//         multicallCustomContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11', // TODO double check this across all networks
//       });

//       const tokensToQuery = userStakeData.flatMap((stakeData) => [
//         {
//           address: stakeData.waTokenData.waTokenUnderlying,
//           decimals: 18, // TODO Decimals
//         },
//         {
//           address: stakeData.waTokenAToken,
//           decimals: 18, // TODO Decimals
//         },
//       ]);

//       const contractCallContext = tokensToQuery.map((token) => ({
//         reference: token.address,
//         contractAddress: token.address,
//         abi: [
//           {
//             name: 'balanceOf',
//             type: 'function',
//             stateMutability: 'view',
//             inputs: [{ name: 'account', type: 'address' }],
//             outputs: [{ name: 'balance', type: 'uint256' }],
//           },
//         ],
//         calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [user] }],
//       }));

//       const { results } = await multicall.call(contractCallContext);

//       // Map balances back to stake data
//       const enrichedData = userStakeData.map((stakeData) => {
//         const underlyingBalance =
//           results[stakeData.waTokenUnderlying]?.callsReturnContext[0]?.returnValues[0];
//         const aTokenBalance =
//           results[stakeData.waTokenAToken]?.callsReturnContext[0]?.returnValues[0];

//         const totalUnderlyingBalance =
//           underlyingBalance && aTokenBalance
//             ? Number(formatUnits(underlyingBalance, 18)) + Number(formatUnits(aTokenBalance, 18))
//             : 0;

//         return {
//           ...stakeData,
//           totalUnderlyingBalance: totalUnderlyingBalance.toString(),
//         };
//       });

//       return enrichedData;
//     },
//   });
// };
