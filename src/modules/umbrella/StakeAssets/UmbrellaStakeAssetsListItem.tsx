import { Box, Typography } from '@mui/material';
// import { useRouter } from 'next/router';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

// import { useRewardsApy } from 'src/modules/umbrella/hooks/useStakeData';
// import { useRootStore } from 'src/store/root';
// import { useShallow } from 'zustand/shallow';
import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { AmountStakedItem } from '../AmountStakedItem';
import { AvailableToClaimItem } from '../AvailableToClaimItem';
import { AvailableToStakeItem } from '../AvailableToStakeItem';
import { StakingApyItem } from '../StakingApyItem';

export const UmbrellaStakeAssetsListItem = ({ ...umbrellaStakeAsset }: MergedStakeData) => {
  // const [trackEvent, currentMarket] = useRootStore(
  //   useShallow((store) => [store.trackEvent, store.currentMarket])
  // );

  // const APY = useRewardsApy(umbrellaStakeAsset.rewards);

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

      <ListColumn>
        <StakingApyItem rewards={umbrellaStakeAsset.rewards} />
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
    </ListItem>
  );
};
