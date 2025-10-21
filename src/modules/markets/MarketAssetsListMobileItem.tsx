import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider } from '@mui/material';
import { KernelAirdropTooltip } from 'src/components/infoTooltips/KernelAirdropTooltip';
import { SpkAirdropTooltip } from 'src/components/infoTooltips/SpkAirdropTooltip';
import { SuperFestTooltip } from 'src/components/infoTooltips/SuperFestTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { MARKETS } from 'src/utils/events';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';
import { ReserveWithProtocolIncentives } from './MarketAssetsList';

export const MarketAssetsListMobileItem = ({ ...reserve }: ReserveWithProtocolIncentives) => {
  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );

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
    <ListMobileItemWrapper
      symbol={reserve.underlyingToken.symbol}
      iconSymbol={displayIconSymbol}
      name={reserve.underlyingToken.name}
      underlyingAsset={reserve.underlyingToken.address}
      currentMarket={currentMarket}
      isIsolated={reserve.isolationModeConfig?.canBeCollateral}
      frozen={reserve.isFrozen}
      borrowEnabled={true}
      showExternalIncentivesTooltips={{
        superFestRewards: externalIncentivesTooltipsSupplySide.superFestRewards,
        spkAirdrop: externalIncentivesTooltipsSupplySide.spkAirdrop,
        kernelPoints: externalIncentivesTooltipsSupplySide.kernelPoints,
      }}
    >
      <Row caption={<Trans>Total supplied</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <FormattedNumber compact value={reserve.size.amount.value} variant="secondary14" />
          <ReserveSubheader value={reserve.size.usd} rightAlign={true} />
        </Box>
      </Row>
      <Row
        caption={<Trans>Supply APY</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={reserve.supplyInfo.apy.value}
          incentives={reserve.supplyProtocolIncentives}
          address={reserve.aToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="secondary14"
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
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row caption={<Trans>Total borrowed</Trans>} captionVariant="description" mb={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-end' },
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {reserve.borrowInfo && Number(reserve.borrowInfo?.total.amount.value) > 0 ? (
            <>
              <FormattedNumber
                compact
                value={Number(reserve.borrowInfo.total.amount.value)}
                variant="secondary14"
              />
              <ReserveSubheader value={String(reserve.borrowInfo.total.usd)} rightAlign={true} />
            </>
          ) : (
            <NoData variant={'secondary14'} color="text.secondary" />
          )}
        </Box>
      </Row>
      <Row
        caption={
          <VariableAPYTooltip
            text={<Trans>Borrow APY, variable</Trans>}
            key="APY_list_mob_variable_type"
            variant="description"
          />
        }
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={
            reserve.borrowInfo && Number(reserve.borrowInfo.total.amount.value) > 0
              ? String(reserve.borrowInfo.apy.value)
              : '-1'
          }
          incentives={reserve.borrowProtocolIncentives}
          address={reserve.vToken.address}
          symbol={reserve.underlyingToken.symbol}
          variant="secondary14"
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
      </Row>
      <Button
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(reserve.underlyingToken.address.toLowerCase(), currentMarket)}
        fullWidth
        onClick={() => {
          trackEvent(MARKETS.DETAILS_NAVIGATION, {
            type: 'button',
            asset: reserve.underlyingToken.address.toLowerCase(),
            market: currentMarket,
            assetName: reserve.underlyingToken.name,
          });
        }}
      >
        <Trans>View details</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
