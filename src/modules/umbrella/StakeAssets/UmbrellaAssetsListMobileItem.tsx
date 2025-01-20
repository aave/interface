import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';

import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { useShallow } from 'zustand/shallow';

import { Row } from '../../../components/primitives/Row';
import { ListMobileItemWrapper } from '../../dashboard/lists/ListMobileItemWrapper';
import { StakingApyItem } from '../StakingApyItem';
import { AvailableToStakeItem } from '../AvailableToStakeItem';
import { AvailableToClaimItem } from '../AvailableToClaimItem';

export const UmbrellaAssetsListMobileItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  const [currentMarket] = useRootStore(useShallow((store) => [store.currentMarket]));
  const { openUmbrella } = useModalContext();

  return (
    <ListMobileItemWrapper
      symbol={umbrellaStakeAsset.symbol}
      iconSymbol={umbrellaStakeAsset.iconSymbol}
      name={umbrellaStakeAsset.name}
      underlyingAsset={umbrellaStakeAsset.stakeTokenUnderlying}
      currentMarket={currentMarket}
    >
      <Row caption={<Trans>APY</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <StakingApyItem rewards={umbrellaStakeAsset.rewards} />
        </Box>
      </Row>
      <Row
        caption={<Trans>Available to stake</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <AvailableToStakeItem stakeData={umbrellaStakeAsset} />
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
          <AvailableToClaimItem stakeData={umbrellaStakeAsset} />
        </Box>
      </Row>

      <Button
        variant="outlined"
        // component={Link}
        // href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        fullWidth
        onClick={() => {
          openUmbrella(umbrellaStakeAsset.stakeToken, umbrellaStakeAsset.symbol);
          //   trackEvent(MARKETS.DETAILS_NAVIGATION, {
          //     type: 'button',
          //     asset: reserve.underlyingAsset,
          //     market: currentMarket,
          //     assetName: reserve.name,
          //   });
        }}
      >
        <Trans>Stake</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
