import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { StakingDropdown } from 'src/modules/umbrella/helpers/StakingDropdown';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { Row } from '../../../components/primitives/Row';
import { ListMobileItemWrapper } from '../../dashboard/lists/ListMobileItemWrapper';
import { AmountSharesItem } from '../AmountSharesItem';
import { AmountStakedUnderlyingItem } from '../AmountStakedUnderlyingItem';
import { AvailableToClaimItem } from '../AvailableToClaimItem';
import { AvailableToStakeItem } from '../AvailableToStakeItem';
import { ApyTooltip } from '../helpers/ApyTooltip';
import { StakingApyItem } from '../StakingApyItem';
import { StakeAssetName } from './StakeAssetName';

export const UmbrellaAssetsListMobileItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));

  return (
    <ListMobileItemWrapper>
      <ListColumn isRow>
        <StakeAssetName
          iconSymbol={umbrellaStakeAsset.iconSymbol}
          symbol={umbrellaStakeAsset.symbol}
          totalAmountStakedUSD={umbrellaStakeAsset.formattedStakeTokenData.totalAmountStakedUSD}
          targetLiquidityUSD={umbrellaStakeAsset.formattedStakeTokenData.targetLiquidityUSD}
          apyAtTargetLiquidity={umbrellaStakeAsset.totalRewardApyAtTargetLiquidity}
          explorerUrl={`${currentNetworkConfig.explorerLink}/address/${umbrellaStakeAsset.tokenAddress}`}
        />
      </ListColumn>
      <Row mt={2} caption={<ApyTooltip />} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <StakingApyItem stakeData={umbrellaStakeAsset} isMobile />
        </Box>
      </Row>
      <Row
        caption={<Trans>Your staked amount</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <AmountStakedUnderlyingItem stakeData={umbrellaStakeAsset} />
      </Row>
      <Row
        caption={<Trans>Available to stake</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <AmountSharesItem stakeData={umbrellaStakeAsset} />
      </Row>
      <Row
        caption={<Trans>Available to stake</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <AvailableToStakeItem stakeData={umbrellaStakeAsset} isMobile />
      </Row>

      <Row caption={<Trans>Available to claim</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <AvailableToClaimItem stakeData={umbrellaStakeAsset} isMobile />
        </Box>
      </Row>

      <StakingDropdown stakeData={umbrellaStakeAsset} />
    </ListMobileItemWrapper>
  );
};
