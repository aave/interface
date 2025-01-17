import { normalize } from '@aave/math-utils';
import { useStakeData, useUserStakeData } from 'src/modules/umbrella/hooks/useStakeData';
import {
  StakeData,
  StakeUserBalances,
  StakeUserCooldown,
  StakeUserData,
} from 'src/modules/umbrella/services/StakeDataProviderService';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { combineQueries } from '../pool/utils';

interface FormattedBalance {
  stakeTokenBalance: string;
  stakeTokenRedeemableAmount: string;
  underlyingTokenBalance: string;
  underlyingWaTokenBalance: string;
  underlyingWaTokenATokenBalance: string;
}

export interface MergedStakeData extends StakeData {
  balances: StakeUserBalances;
  formattedBalances: FormattedBalance;
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
      formattedBalances: {
        stakeTokenBalance: normalize(
          matchingBalance.balances.stakeTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        stakeTokenRedeemableAmount: normalize(
          matchingBalance.balances.stakeTokenRedeemableAmount,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingTokenBalance: normalize(
          matchingBalance.balances.underlyingTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingWaTokenBalance: normalize(
          matchingBalance.balances.underlyingWaTokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
        underlyingWaTokenATokenBalance: normalize(
          matchingBalance.balances.underlyingWaTokenATokenBalance,
          stakeItem.underlyingTokenDecimals
        ),
      },
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
