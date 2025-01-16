import { useStakeData, useUserStakeData } from 'src/modules/umbrella/hooks/useStakeData';
import {
  StakeData,
  StakeUserBalances,
  StakeUserCooldown,
  StakeUserData,
} from 'src/modules/umbrella/services/StakeDataProviderService';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { combineQueries } from '../pool/utils';

export interface MergedStakeData extends StakeData {
  balances: StakeUserBalances;
  cooldownData: StakeUserCooldown;
  name: string;
  symbol: string;
  decimals: number;
  iconSymbol: string;
}

const formatUmbrellaSummary = (stakeData: StakeData[], userStakeData: StakeUserData[]) => {
  const mergedData = stakeData.reduce<MergedStakeData[]>((acc, stakeItem) => {
    const matchingBalance = userStakeData.find(
      (balanceItem) => balanceItem.stakeToken.toLowerCase() === stakeItem.stakeToken.toLowerCase()
    );

    if (!matchingBalance) {
      return acc;
    }

    acc.push({
      ...stakeItem,
      balances: matchingBalance.balances,
      cooldownData: matchingBalance.cooldown,
      name: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingName
        : stakeItem.stakeTokenName,
      symbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
      decimals: stakeItem.underlyingTokenDecimals,
      iconSymbol: stakeItem.underlyingIsWaToken
        ? stakeItem.waTokenData.waTokenUnderlyingSymbol
        : stakeItem.stakeTokenSymbol,
    });

    return acc;
  }, []);

  return mergedData;
};

export const useUmbrellaSummary = (marketData: MarketDataType) => {
  const stakeDataQuery = useStakeData(marketData);
  const userStakeDataQuery = useUserStakeData(marketData);

  return combineQueries([stakeDataQuery, userStakeDataQuery] as const, formatUmbrellaSummary);
};

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
