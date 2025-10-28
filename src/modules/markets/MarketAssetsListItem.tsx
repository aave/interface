import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { KernelAirdropTooltip } from 'src/components/infoTooltips/KernelAirdropTooltip';
import { OffboardingTooltip } from 'src/components/infoTooltips/OffboardingToolTip';
import { RenFILToolTip } from 'src/components/infoTooltips/RenFILToolTip';
import { SpkAirdropTooltip } from 'src/components/infoTooltips/SpkAirdropTooltip';
import { SuperFestTooltip } from 'src/components/infoTooltips/SuperFestTooltip';
import { IsolatedEnabledBadge } from 'src/components/isolationMode/IsolatedBadge';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { AssetsBeingOffboarded } from 'src/components/Warnings/OffboardingWarning';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { MARKETS } from 'src/utils/events';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { AMPLToolTip } from '../../components/infoTooltips/AMPLToolTip';
import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { TokenIcon } from '../../components/primitives/TokenIcon';
import { ReserveWithProtocolIncentives } from './MarketAssetsList';

export const MarketAssetsListItem = ({ ...reserve }: ReserveWithProtocolIncentives) => {
  const router = useRouter();
  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );
  const offboardingDiscussion =
    AssetsBeingOffboarded[currentMarket]?.[reserve.underlyingToken.symbol];
  const externalIncentivesTooltipsSupplySide = showExternalIncentivesTooltip(
    reserve.underlyingToken.symbol,
    currentMarket,
    ProtocolAction.supply
  );
  const externalIncentivesTooltipsBorrowSide = showExternalIncentivesTooltip(
    reserve.underlyingToken.symbol,
    currentMarket,
    ProtocolAction.borrow
  );
  const { iconSymbol } = fetchIconSymbolAndName({
    underlyingAsset: reserve.underlyingToken.address,
    symbol: reserve.underlyingToken.symbol,
    name: reserve.underlyingToken.name,
  });

  const displayIconSymbol =
    iconSymbol?.toLowerCase() !== reserve.underlyingToken.symbol.toLowerCase()
      ? iconSymbol
      : reserve.underlyingToken.symbol;

  return (
    <ListItem
      px={6}
      minHeight={76}
      onClick={() => {
        trackEvent(MARKETS.DETAILS_NAVIGATION, {
          type: 'Row',
          assetName: reserve.underlyingToken.name,
          asset: reserve.underlyingToken.address.toLowerCase(),
          market: currentMarket,
        });
        router.push(
          ROUTES.reserveOverview(reserve.underlyingToken.address.toLowerCase(), currentMarket)
        );
      }}
      sx={{ cursor: 'pointer' }}
      button
      data-cy={`marketListItemListItem_${reserve.underlyingToken.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={displayIconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Typography variant="h4" noWrap>
            {reserve.underlyingToken.name}
          </Typography>

          <Box
            sx={{
              p: { xs: '0', xsm: '3.625px 0px' },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserve.underlyingToken.symbol}
              {reserve.isolationModeConfig?.canBeCollateral && (
                <span style={{ marginLeft: '8px' }}>
                  <IsolatedEnabledBadge />
                </span>
              )}
            </Typography>
          </Box>
        </Box>
        {reserve.underlyingToken.symbol === 'AMPL' && <AMPLToolTip />}
        {reserve.underlyingToken.symbol === 'renFIL' && <RenFILToolTip />}
        {offboardingDiscussion && <OffboardingTooltip discussionLink={offboardingDiscussion} />}
      </ListColumn>

      <ListColumn>
        <FormattedNumber compact value={reserve.size.amount.value} variant="main16" />
        <ReserveSubheader value={reserve.size.usd} />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.supplyInfo.apy.value}
          incentives={reserve.supplyProtocolIncentives}
          address={reserve.aToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="main16"
          symbolsVariant="secondary16"
          tooltip={
            <>
              {externalIncentivesTooltipsSupplySide.superFestRewards && <SuperFestTooltip />}
              {externalIncentivesTooltipsSupplySide.spkAirdrop && <SpkAirdropTooltip />}
              {externalIncentivesTooltipsSupplySide.kernelPoints && <KernelAirdropTooltip />}
            </>
          }
          market={currentMarket}
          protocolAction={ProtocolAction.supply}
        />
      </ListColumn>

      <ListColumn>
        {reserve.borrowInfo && Number(reserve.borrowInfo.total.amount.value) > 0 ? (
          <>
            <FormattedNumber
              compact
              value={Number(reserve.borrowInfo?.total.amount.value)}
              variant="main16"
            />{' '}
            <ReserveSubheader value={String(reserve.borrowInfo?.total.usd)} />
          </>
        ) : (
          <NoData variant={'secondary14'} color="text.secondary" />
        )}
      </ListColumn>
      <ListColumn>
        <FormattedNumber compact value={reserve.formattedAvailableLiquidity} variant="main16" />
        <ReserveSubheader value={Math.max(Number(reserve?.availableLiquidityUSD), 0).toString()} />
      </ListColumn>
      <ListColumn>
        <IncentivesCard
          value={
            Number(reserve.borrowInfo?.total.amount.value) > 0
              ? String(reserve.borrowInfo?.apy.value)
              : '-1'
          }
          incentives={reserve.borrowProtocolIncentives}
          address={reserve.vToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="main16"
          symbolsVariant="secondary16"
          tooltip={
            <>
              {externalIncentivesTooltipsBorrowSide.superFestRewards && <SuperFestTooltip />}
              {externalIncentivesTooltipsBorrowSide.spkAirdrop && <SpkAirdropTooltip />}
            </>
          }
          market={currentMarket}
          protocolAction={ProtocolAction.borrow}
        />
        {reserve.borrowInfo?.borrowingState === 'DISABLED' &&
          !reserve.isFrozen &&
          reserve.borrowInfo.total.amount.value !== '0' && <ReserveSubheader value={'Disabled'} />}
      </ListColumn>

      <ListColumn minWidth={95} maxWidth={95} align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(
            reserve.underlyingToken.address.toLowerCase(),
            currentMarket
          )}
          onClick={() =>
            trackEvent(MARKETS.DETAILS_NAVIGATION, {
              type: 'Button',
              assetName: reserve.underlyingToken.name,
              asset: reserve.underlyingToken.address.toLowerCase(),
              market: currentMarket,
            })
          }
        >
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
