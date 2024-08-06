import { Stake } from '@aave/contract-helpers';
import { StakeTokenUIData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { normalize } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { getStakeIndex, oracles, stakedTokens } from './common';

export type StakeTokenFormatted = StakeTokenUIData & {
  stakeApyFormatted: string;
  stakeTokenPriceUSDFormatted: string;
  rewardTokenPriceUSDFormatted: string;
  maxSlashablePercentageFormatted: string;
  totalSupplyFormatted: string;
  totalSupplyUSDFormatted: string;
  stakeTokenContract: string;
};

export const useGeneralStakeUiData = (marketData: MarketDataType, select?: Stake) => {
  const { uiStakeDataService } = useSharedDependencies();

  return useQuery({
    queryFn: () =>
      uiStakeDataService.getGeneralStakeUIDataHumanized(marketData, stakedTokens, oracles),
    queryKey: queryKeysFactory.generalStakeUiData(marketData, stakedTokens, oracles),
    refetchInterval: POLLING_INTERVAL,
    select: (data) => {
      const stakeData = data.stakeData;
      const formattedData = formatData(stakeData);
      if (select) {
        return [formattedData[getStakeIndex(select)]];
      } else {
        return formattedData;
      }
    },
  });
};

function formatData(data: StakeTokenUIData[]): StakeTokenFormatted[] {
  return data.map((stakeData, index) => ({
    ...stakeData,
    maxSlashablePercentageFormatted: (Number(stakeData.maxSlashablePercentage) / 10000).toString(),
    stakeApyFormatted: (Number(stakeData.stakeApy) / 10000).toString(),
    stakeTokenPriceUSDFormatted: normalize(stakeData.stakeTokenPriceUSD, 8),
    rewardTokenPriceUSDFormatted: normalize(stakeData.rewardTokenPriceUSD, 8),
    totalSupplyFormatted: normalize(stakeData.stakeTokenTotalSupply, 18),
    totalSupplyUSDFormatted: formatUnits(
      BigNumber.from(stakeData.stakeTokenTotalSupply).mul(stakeData.stakeTokenPriceUSD),
      18 + 8
    ),
    stakeTokenContract: stakedTokens[index],
  }));
}
