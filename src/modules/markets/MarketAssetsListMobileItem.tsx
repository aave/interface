import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider } from '@mui/material';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { SpkAirdropTooltip } from 'src/components/infoTooltips/SpkAirdropTooltip';
import { SuperFestTooltip } from 'src/components/infoTooltips/SuperFestTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { NoData } from 'src/components/primitives/NoData';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { MARKETS } from 'src/utils/mixPanelEvents';
import { showExternalIncentivesTooltip } from 'src/utils/utils';

import { IncentivesCard } from '../../components/incentives/IncentivesCard';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { Link, ROUTES } from '../../components/primitives/Link';
import { Row } from '../../components/primitives/Row';
import { ComputedReserveData } from '../../hooks/app-data-provider/useAppDataProvider';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';

export const MarketAssetsListMobileItem = ({ ...reserve }: ComputedReserveData) => {
  const { currentMarket } = useProtocolDataContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const externalIncentivesTooltipsSupplySide = showExternalIncentivesTooltip(
    reserve.symbol,
    currentMarket,
    ProtocolAction.supply
  );
  const externalIncentivesTooltipsBorrowSide = showExternalIncentivesTooltip(
    reserve.symbol,
    currentMarket,
    ProtocolAction.borrow
  );

  return (
    <ListMobileItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      isIsolated={reserve.isIsolated}
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
          <FormattedNumber compact value={reserve.totalLiquidity} variant="secondary14" />
          <ReserveSubheader value={reserve.totalLiquidityUSD} rightAlign={true} />
        </Box>
      </Row>
      <Row
        caption={<Trans>Supply APY</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <IncentivesCard
            align="flex-end"
            value={reserve.supplyAPY}
            incentives={reserve.aIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
            tooltip={
              <>
                {externalIncentivesTooltipsSupplySide.superFestRewards && <SuperFestTooltip />}
                {externalIncentivesTooltipsSupplySide.spkAirdrop && <SpkAirdropTooltip />}
              </>
            }
          />
          <MeritIncentivesButton
            symbol={reserve.symbol}
            market={currentMarket}
            protocolAction={ProtocolAction.supply}
          />
        </Box>
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
          {Number(reserve.totalDebt) > 0 ? (
            <>
              <FormattedNumber compact value={reserve.totalDebt} variant="secondary14" />
              <ReserveSubheader value={reserve.totalDebtUSD} rightAlign={true} />
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <IncentivesCard
            align="flex-end"
            value={Number(reserve.totalVariableDebtUSD) > 0 ? reserve.variableBorrowAPY : '-1'}
            incentives={reserve.vIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
            tooltip={
              <>
                {externalIncentivesTooltipsBorrowSide.superFestRewards && <SuperFestTooltip />}
                {externalIncentivesTooltipsBorrowSide.spkAirdrop && <SpkAirdropTooltip />}
              </>
            }
          />
          <MeritIncentivesButton
            symbol={reserve.symbol}
            market={currentMarket}
            protocolAction={ProtocolAction.borrow}
          />
          {!reserve.borrowingEnabled &&
            Number(reserve.totalVariableDebt) > 0 &&
            !reserve.isFrozen && <ReserveSubheader value={'Disabled'} />}
        </Box>
      </Row>
      <Button
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        fullWidth
        onClick={() => {
          trackEvent(MARKETS.DETAILS_NAVIGATION, {
            type: 'button',
            asset: reserve.underlyingAsset,
            market: currentMarket,
            assetName: reserve.name,
          });
        }}
      >
        <Trans>View details</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
