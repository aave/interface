import React from 'react';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Divider, Typography, TypographyProps } from '@mui/material';
import Paper from '@mui/material/Paper';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import { useReserveRatesHistory } from 'src/hooks/useReservesHistory';
import { ParentSize } from '@visx/responsive';
import { ApyChart } from '../reserve-overview/ApyChart';
import { InterestRateModelChart } from '../reserve-overview/InterestRateModelChart';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 4,
      flexWrap: 'wrap',
      mb: '24px',
      ...props.sx,
    }}
    {...props}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  <Typography variant="subheader1" sx={{ width: { sm: '170px' } }} {...props} />
);

export const ReserveConfiguration: React.FC<{ reserve: ComputedReserveData }> = ({ reserve }) => {
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const renderCharts = !!currentNetworkConfig.ratesHistoryApiUrl;
  const eMode = true;
  const { data } = useReserveRatesHistory(
    reserve
      ? `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`
      : ''
  ); // TODO: might make sense to move this to gql as well
  return (
    <Paper sx={{ minHeight: '1000px', py: '16px', px: '24px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb: '24px',
        }}
      >
        <Typography variant="h3">
          <Trans>Reserve status &#38; configuration</Trans>
        </Typography>
        {eMode && (
          <Typography color="text.secondary" variant="description" sx={{ display: 'inline-flex' }}>
            <Trans>E-Mode category</Trans>
            <Typography variant="subheader1" sx={{ ml: 2 }}>
              Stablecoin
            </Typography>
            <HelpOutlinedIcon fontSize="small" sx={{ color: 'divider', ml: 1 }} />
          </Typography>
        )}
      </Box>

      <PanelRow>
        <PanelTitle>Supply Info</PanelTitle>
        <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <TopInfoPanelItem title={<Trans>Total supplied</Trans>} hideIcon variant="light">
              <FormattedNumber
                value={reserve.totalLiquidityUSD /** TODO: should this be liquidity or all? */}
                symbol="USD"
                variant="main16"
              />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>APY</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.supplyAPY} percent variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>Supply cap</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.supplyCapUSD} symbol="USD" variant="main16" />
            </TopInfoPanelItem>
          </Box>

          {renderCharts && (
            <div style={{ height: 300, marginLeft: 0, marginTop: 20 }}>
              <ParentSize>
                {(parent) => (
                  <ApyChart
                    width={parent.width}
                    height={parent.height}
                    data={data}
                    fields={[{ name: 'liquidityRate', color: '#2EBAC6' }]}
                  />
                )}
              </ParentSize>
            </div>
          )}

          <Paper
            sx={{
              mt: 4,
              py: '12px',
              px: '16px',
              background: 'background.surface',
            }}
          >
            <div>
              <Typography sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Trans>Can be used as collateral:</Trans>
                {reserve.usageAsCollateralEnabled ? (
                  <>
                    <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
                    <Trans>Yes</Trans>
                  </>
                ) : (
                  <>
                    <CloseRoundedIcon fontSize="small" color="error" sx={{ ml: 2 }} />
                    <Trans>No</Trans>
                  </>
                )}
              </Typography>
            </div>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 6,
                flexWrap: 'wrap',
                mt: '16px',
              }}
            >
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Max LTV</Trans>
                <FormattedNumber
                  value={reserve.formattedBaseLTVasCollateral}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Liquidation threshold</Trans>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationThreshold}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Liquidation penalty</Trans>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationBonus}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                />
              </Typography>
            </Box>
          </Paper>
        </div>
      </PanelRow>

      <Divider sx={{ my: '40px' }} />

      <PanelRow>
        <PanelTitle>Borrow info</PanelTitle>
        <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <TopInfoPanelItem title={<Trans>Total borrowed</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.totalDebtUSD} symbol="USD" variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>APY, variable</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.variableBorrowAPY} percent variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>APY, stable</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.stableBorrowAPY} percent variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>Borrow cap</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.borrowCapUSD} symbol="USD" variant="main16" />
            </TopInfoPanelItem>
          </Box>
          {renderCharts && (
            <div style={{ height: 300, marginLeft: 0, marginTop: 20 }}>
              <ParentSize>
                {(parent) => (
                  <ApyChart
                    width={parent.width}
                    height={parent.height}
                    data={data}
                    fields={[
                      { name: 'stableBorrowRate', color: '#0062D2' },
                      { name: 'variableBorrowRate', color: '#B6509E' },
                    ]}
                  />
                )}
              </ParentSize>
            </div>
          )}
        </div>
      </PanelRow>

      <Divider sx={{ my: '40px' }} />

      <PanelRow>
        <PanelTitle>Interest rate model</PanelTitle>
        <div style={{ height: 300, marginLeft: 0, marginTop: 20, width: 400 }}>
          <ParentSize>
            {(parent) => <InterestRateModelChart width={parent.width} height={parent.height} />}
          </ParentSize>
        </div>
      </PanelRow>
    </Paper>
  );
};
