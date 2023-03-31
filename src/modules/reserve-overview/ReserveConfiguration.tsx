import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Paper, SvgIcon, Typography } from '@mui/material';
import { getFrozenProposalLink } from 'src/components/infoTooltips/FrozenTooltip';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import { BorrowDisabledWarning } from 'src/components/Warnings/BorrowDisabledWarning';
import { BUSDOffBoardingWarning } from 'src/components/Warnings/BUSDOffBoardingWarning';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { BROKEN_ASSETS } from 'src/hooks/useReservesHistory';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { BorrowInfo } from './BorrowInfo';
import { InterestRateModelGraphContainer } from './graphs/InterestRateModelGraphContainer';
import { PanelItem, PanelRow, PanelTitle } from './ReservePanels';
import { SupplyInfo } from './SupplyInfo';

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const { currentNetworkConfig, currentMarketData, currentMarket } = useProtocolDataContext();
  const reserveId =
    reserve.underlyingAsset + currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  const renderCharts =
    !!currentNetworkConfig.ratesHistoryApiUrl &&
    !currentMarketData.disableCharts &&
    !BROKEN_ASSETS.includes(reserveId);
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
  const showSupplyCapStatus: boolean = reserve.supplyCap !== '0';
  const showBorrowCapStatus: boolean = reserve.borrowCap !== '0';

  return (
    <Paper sx={{ py: '16px', px: '24px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb:
            reserve.isFrozen || reserve.symbol == 'AMPL' || reserve.symbol === 'stETH'
              ? '0px'
              : '36px',
        }}
      >
        <Typography variant="h3">
          <Trans>Reserve status &#38; configuration</Trans>
        </Typography>
      </Box>

      <Box>
        {reserve.isFrozen && reserve.symbol != 'BUSD' ? (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
            <Trans>
              This asset is frozen due to an Aave community decision.{' '}
              <Link
                href={getFrozenProposalLink(reserve.symbol, currentMarket)}
                sx={{ textDecoration: 'underline' }}
              >
                <Trans>More details</Trans>
              </Link>
            </Trans>
          </Warning>
        ) : reserve.symbol === 'BUSD' ? (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
            <BUSDOffBoardingWarning />
          </Warning>
        ) : (
          reserve.symbol == 'AMPL' && (
            <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
              <AMPLWarning />
            </Warning>
          )
        )}
      </Box>

      <PanelRow>
        <PanelTitle>Supply Info</PanelTitle>
        <SupplyInfo
          reserve={reserve}
          currentMarketData={currentMarketData}
          renderCharts={renderCharts}
          showSupplyCapStatus={showSupplyCapStatus}
          supplyCap={supplyCap}
          debtCeiling={debtCeiling}
        />
      </PanelRow>

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <Divider sx={{ my: '40px' }} />
          <PanelRow>
            <PanelTitle>Borrow info</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              {!reserve.borrowingEnabled && (
                <Warning sx={{ mb: '40px' }} severity="error">
                  <BorrowDisabledWarning symbol={reserve.symbol} currentMarket={currentMarket} />
                </Warning>
              )}
              <BorrowInfo
                reserve={reserve}
                currentMarketData={currentMarketData}
                currentNetworkConfig={currentNetworkConfig}
                renderCharts={renderCharts}
                showBorrowCapStatus={showBorrowCapStatus}
                borrowCap={borrowCap}
              />
            </Box>
          </PanelRow>
        </>
      )}

      {reserve.eModeCategoryId !== 0 && (
        <>
          <Divider sx={{ my: '40px' }} />
          <PanelRow>
            <PanelTitle>E-Mode info</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="secondary14" color="text.secondary">
                  <Trans>E-Mode Category</Trans>
                </Typography>
                <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
                  <LightningBoltGradient />
                </SvgIcon>
                <Typography variant="subheader1">{getEmodeMessage(reserve.eModeLabel)}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  pt: '12px',
                }}
              >
                <ReserveOverviewBox
                  title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLtv}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
                <ReserveOverviewBox
                  title={
                    <LiquidationThresholdTooltip
                      variant="description"
                      text={<Trans>Liquidation threshold</Trans>}
                    />
                  }
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLiquidationThreshold}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
                <ReserveOverviewBox
                  title={
                    <LiquidationPenaltyTooltip
                      variant="description"
                      text={<Trans>Liquidation penalty</Trans>}
                    />
                  }
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLiquidationBonus}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
              </Box>
              <Typography variant="caption" color="text.secondary" paddingTop="24px">
                <Trans>
                  E-Mode increases your LTV for a selected category of assets, meaning that when
                  E-mode is enabled, you will have higher borrowing power over assets of the same
                  E-mode category which are defined by Aave Governance. You can enter E-Mode from
                  your{' '}
                  <Link
                    href={ROUTES.dashboard}
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    Dashboard
                  </Link>
                  . To learn more about E-Mode and applied restrictions in{' '}
                  <Link
                    href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    FAQ
                  </Link>{' '}
                  or{' '}
                  <Link
                    href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    Aave V3 Technical Paper
                  </Link>
                  .
                </Trans>
              </Typography>
            </Box>
          </PanelRow>
        </>
      )}

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <Divider sx={{ my: '40px' }} />

          <PanelRow>
            <PanelTitle>Interest rate model</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
              >
                <PanelItem title={<Trans>Utilization Rate</Trans>} className="borderless">
                  <FormattedNumber
                    value={reserve.borrowUsageRatio}
                    percent
                    variant="main16"
                    compact
                  />
                </PanelItem>
                <Button
                  href={currentNetworkConfig.explorerLinkBuilder({
                    address: reserve.interestRateStrategyAddress,
                  })}
                  endIcon={
                    <SvgIcon sx={{ width: 14, height: 14 }}>
                      <ExternalLinkIcon />
                    </SvgIcon>
                  }
                  component={Link}
                  size="small"
                  variant="outlined"
                  sx={{ verticalAlign: 'top' }}
                >
                  <Trans>Interest rate strategy</Trans>
                </Button>
              </Box>
              <InterestRateModelGraphContainer reserve={reserve} />
            </Box>
          </PanelRow>
        </>
      )}
    </Paper>
  );
};
