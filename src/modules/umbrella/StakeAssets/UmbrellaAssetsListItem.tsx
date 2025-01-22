import { Box, Typography } from '@mui/material';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { TokenIcon } from '../../../components/primitives/TokenIcon';

export const UmbrellaAssetsListItem = ({ ...reserve }: MergedStakeData) => {
  // const [trackEvent, currentMarket] = useRootStore(
  //   useShallow((store) => [store.trackEvent, store.currentMarket])
  // );

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
    </ListItem>
  );
};
