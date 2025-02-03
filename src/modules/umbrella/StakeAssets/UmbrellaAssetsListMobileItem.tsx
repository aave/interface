import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { StakingDropdown } from 'src/modules/umbrella/helpers/StakingDropdown';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { Row } from '../../../components/primitives/Row';
import { ListMobileItemWrapper } from '../../dashboard/lists/ListMobileItemWrapper';
import { AmountStakedItem } from '../AmountStakedItem';
import { AvailableToClaimItem } from '../AvailableToClaimItem';
import { AvailableToStakeItem } from '../AvailableToStakeItem';
import { StakingApyItem } from '../StakingApyItem';

export const UmbrellaAssetsListMobileItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  const [currentMarket] = useRootStore(useShallow((store) => [store.currentMarket]));
  return (
    <ListMobileItemWrapper
      symbol={umbrellaStakeAsset.symbol}
      iconSymbol={umbrellaStakeAsset.iconSymbol}
      name={umbrellaStakeAsset.name}
      underlyingAsset={umbrellaStakeAsset.stakeTokenUnderlying}
      currentMarket={currentMarket}
    >
      <Row caption={<Trans>Staking APY</Trans>} captionVariant="description" mb={3}>
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
        caption={<Trans>Amount staked</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <AmountStakedItem stakeData={umbrellaStakeAsset} />
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
