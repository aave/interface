import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { TokenIcon } from '../../../components/primitives/TokenIcon';

export const UmbrellaAssetsListItem = ({ ...reserve }: MergedStakeData) => {
  // const [trackEvent, currentMarket] = useRootStore(
  //   useShallow((store) => [store.trackEvent, store.currentMarket])
  // );
  const { openUmbrella } = useModalContext();

  return (
    <ListItem
      px={6}
      minHeight={76}
      // onClick={() => {
      //   trackEvent(MARKETS.DETAILS_NAVIGATION, {
      //     type: 'Row',
      //     assetName: reserve.name,
      //     asset: reserve.underlyingAsset,
      //     market: currentMarket,
      //   });
      //   router.push(ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket));
      // }}
      sx={{ cursor: 'pointer' }}
      button
      data-cy={`marketListItemListItem_${reserve.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {reserve.name}
          </Typography>

          <Box
            sx={{
              p: { xs: '0', xsm: '3.625px 0px' },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserve.symbol}
            </Typography>
          </Box>
        </Box>
      </ListColumn>

      <ListColumn minWidth={95} maxWidth={95} align="right">
        {/* TODO: Open Modal for staking */}
        <Button
          variant="outlined"
          // component={Link}
          // href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
          // onClick={
          //   () => {
          //     console.log('hello');

          //     openUmbrella(reserve.name, 'USDC');
          //   }
          //   // trackEvent(MARKETS.DETAILS_NAVIGATION, {
          //   //   type: 'Button',
          //   //   assetName: reserve.name,
          //   //   asset: reserve.underlyingAsset,
          //   //   market: currentMarket,
          //   // }
          //   //)
          // }
          onClick={() => {
            // e.preventDefault();

            openUmbrella(reserve.stakeToken, reserve.symbol);
          }}
        >
          <Trans>Stake</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
