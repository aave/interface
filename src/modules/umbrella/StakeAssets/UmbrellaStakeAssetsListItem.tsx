import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { StakingDropdown } from 'src/modules/umbrella/helpers/StakingDropdown';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { AmountStakedItem } from '../AmountStakedItem';
import { AvailableToClaimItem } from '../AvailableToClaimItem';
import { AvailableToStakeItem } from '../AvailableToStakeItem';
import { StakingApyItem } from '../StakingApyItem';
import { StakeAssetName } from './StakeAssetName';

export const UmbrellaStakeAssetsListItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));

  return (
    <ListItem px={6} minHeight={76} sx={{ cursor: 'default' }} button>
      <ListColumn isRow minWidth={275}>
        <StakeAssetName
          iconSymbol={umbrellaStakeAsset.iconSymbol}
          symbol={umbrellaStakeAsset.symbol}
          totalAmountStakedUSD={umbrellaStakeAsset.formattedStakeTokenData.totalAmountStakedUSD}
          targetLiquidityUSD={umbrellaStakeAsset.formattedStakeTokenData.targetLiquidityUSD}
          apyAtTargetLiquidity={umbrellaStakeAsset.totalRewardApyAtTargetLiquidity}
          explorerUrl={`${currentNetworkConfig.explorerLink}/address/${umbrellaStakeAsset.tokenAddress}`}
        />
      </ListColumn>

      <ListColumn>
        <StakingApyItem stakeData={umbrellaStakeAsset} />
      </ListColumn>

      <ListColumn>
        <AmountStakedItem stakeData={umbrellaStakeAsset} />
      </ListColumn>

      <ListColumn>
        <AvailableToStakeItem stakeData={umbrellaStakeAsset} />
      </ListColumn>

      <ListColumn>
        <AvailableToClaimItem stakeData={umbrellaStakeAsset} />
      </ListColumn>

      <ListColumn>
        <StakingDropdown stakeData={umbrellaStakeAsset} />
      </ListColumn>
    </ListItem>
  );
};
