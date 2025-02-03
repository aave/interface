import { ExternalLinkIcon } from '@heroicons/react/outline';
import { IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
// import { useRouter } from 'next/router';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { StakingDropdown } from 'src/modules/umbrella/helpers/StakingDropdown';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

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
  const [currentNetworkConfig] = useRootStore(useShallow((store) => [store.currentNetworkConfig]));

  const TokenContractTooltip = (
    <DarkTooltip title="View token contract" sx={{ display: { xsm: 'none' } }}>
      <IconButton
        LinkComponent={Link}
        href={`${currentNetworkConfig.explorerLink}/address/${umbrellaStakeAsset.stakeToken}`}
      >
        <SvgIcon sx={{ fontSize: '14px' }}>
          <ExternalLinkIcon />
        </SvgIcon>
      </IconButton>
    </DarkTooltip>
  );

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
      sx={{ cursor: 'default' }}
      button
      // data-cy={`marketListItemListItem_${umbrellaStakeAsset.symbol.toUpperCase()}`}
    >
      <ListColumn isRow minWidth={250}>
        <TokenIcon symbol={umbrellaStakeAsset.iconSymbol} fontSize="large" />
        <Stack ml={2}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h4" noWrap>
              Stake {umbrellaStakeAsset.symbol}
            </Typography>
            {TokenContractTooltip}
          </Stack>

          <Stack direction="row">
            <Typography variant="caption" color="text.secondary">
              Total staked:{' '}
              <FormattedNumber
                variant="caption"
                value={umbrellaStakeAsset.formattedStakeTokenData.totalAmountStaked}
                visibleDecimals={2}
              />
              {' ('}
              <FormattedNumber
                variant="caption"
                value={umbrellaStakeAsset.formattedStakeTokenData.totalAmountStakedUSD}
                visibleDecimals={2}
                symbol="usd"
              />
              {')'}
            </Typography>
          </Stack>
        </Stack>
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
