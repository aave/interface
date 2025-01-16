import { ProtocolAction } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { OffboardingTooltip } from 'src/components/infoTooltips/OffboardingToolTip';
import { RenFILToolTip } from 'src/components/infoTooltips/RenFILToolTip';
import { SpkAirdropTooltip } from 'src/components/infoTooltips/SpkAirdropTooltip';
import { SuperFestTooltip } from 'src/components/infoTooltips/SuperFestTooltip';
import { IsolatedEnabledBadge } from 'src/components/isolationMode/IsolatedBadge';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { AssetsBeingOffboarded } from 'src/components/Warnings/OffboardingWarning';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { UmbrellaAssetBreakdown } from 'src/modules/umbrella/helpers/Helpers';
import { useRootStore } from 'src/store/root';
import { MARKETS } from 'src/utils/mixPanelEvents';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { AMPLToolTip } from '../../../components/infoTooltips/AMPLToolTip';
import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../../components/primitives/Link';
import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { ComputedReserveData } from '../../../hooks/app-data-provider/useAppDataProvider';

export const UmbrellaStakeAssetsListItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  const router = useRouter();
  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );

  const { openUmbrella } = useModalContext();

  console.log('umbrellaStakeAsset', umbrellaStakeAsset);

  return (
    <ListItem
      px={6}
      minHeight={76}
      // onClick={() => {
      //   trackEvent(MARKETS.DETAILS_NAVIGATION, {
      //     type: 'Row',
      //     assetName: umbrellaStakeAsset.name,
      //     asset: umbrellaStakeAsset.underlyingAsset,
      //     market: currentMarket,
      //   });
      //   router.push(ROUTES.umbrellaStakeAssetOverview(umbrellaStakeAsset.underlyingAsset, currentMarket));
      // }}
      sx={{ cursor: 'pointer' }}
      button
      // data-cy={`marketListItemListItem_${umbrellaStakeAsset.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={umbrellaStakeAsset.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {umbrellaStakeAsset.name}
          </Typography>

          <Box
            sx={{
              p: { xs: '0', xsm: '3.625px 0px' },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {umbrellaStakeAsset.symbol}
            </Typography>
          </Box>
        </Box>
      </ListColumn>

      <ListColumn>TODO: APY</ListColumn>

      <ListColumn>
        <FormattedNumber
          value={normalize(
            Number(umbrellaStakeAsset.balances.underlyingTokenBalance) +
              Number(umbrellaStakeAsset.balances.underlyingWaTokenBalance) +
              Number(umbrellaStakeAsset.balances.underlyingWaTokenATokenBalance),
            umbrellaStakeAsset.underlyingTokenDecimals
          )}
          compact
          variant="main16"
        />
        <UmbrellaAssetBreakdown
          underlyingTokenBalance={umbrellaStakeAsset.balances.underlyingTokenBalance}
          underlyingWaTokenATokenBalance={
            umbrellaStakeAsset.balances.underlyingWaTokenATokenBalance
          }
          underlyingWaTokenBalance={umbrellaStakeAsset.balances.underlyingWaTokenBalance}
          aToken
          underlyingTokenDecimals={umbrellaStakeAsset.underlyingTokenDecimals}
          symbol={`${umbrellaStakeAsset.iconSymbol}`}
        />
      </ListColumn>

      <ListColumn minWidth={95} maxWidth={95} align="right">
        {/* TODO: Open Modal for staking */}
        <Button
          variant="outlined"
          // component={Link}
          // href={ROUTES.umbrellaStakeAssetOverview(umbrellaStakeAsset.underlyingAsset, currentMarket)}
          // onClick={
          //   () => {
          //     console.log('hello');

          //     openUmbrella(umbrellaStakeAsset.name, 'USDC');
          //   }
          //   // trackEvent(MARKETS.DETAILS_NAVIGATION, {
          //   //   type: 'Button',
          //   //   assetName: umbrellaStakeAsset.name,
          //   //   asset: umbrellaStakeAsset.underlyingAsset,
          //   //   market: currentMarket,
          //   // }
          //   //)
          // }
          onClick={(e) => {
            openUmbrella(umbrellaStakeAsset.stakeToken, umbrellaStakeAsset.symbol);
          }}
        >
          <Trans>Stake</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
