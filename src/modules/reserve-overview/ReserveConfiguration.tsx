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
import { eModeInfo } from 'src/utils/eMode';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';

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

const ChartContainer: React.FC<BoxProps> = (props) => (
  <Box
    sx={{
      height: 300,
      marginLeft: 0,
      flexGrow: 1,
      maxWidth: '100%',
      ...props.sx,
    }}
    {...props}
  />
);

export const ReserveConfiguration: React.FC<{ reserve: ComputedReserveData }> = ({ reserve }) => {
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const renderCharts = !!currentNetworkConfig.ratesHistoryApiUrl;
  const { data, error } = useReserveRatesHistory(
    reserve
      ? `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`
      : ''
  ); // TODO: might make sense to move this to gql as well
  return (
    <Paper sx={{ py: '16px', px: '24px' }}>
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
        {reserve.isEmodeEnabled && (
          <Typography color="text.secondary" variant="description" sx={{ display: 'inline-flex' }}>
            <Trans>E-Mode category</Trans>
            <Typography variant="subheader1" sx={{ ml: 2 }}>
              {eModeInfo[reserve.eModeCategoryId].label}
            </Typography>
            <HelpOutlinedIcon fontSize="small" sx={{ color: 'divider', ml: 1 }} />
          </Typography>
        )}
      </Box>

      <PanelRow>
        <PanelTitle>Supply Info</PanelTitle>
        <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              '& > :not(:last-child)::after': {
                content: '""',
                height: '32px',
                pr: 3,
                mr: 3,
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <TopInfoPanelItem title={<Trans>Total supplied</Trans>} hideIcon variant="light">
              <FormattedNumber
                value={reserve.totalLiquidityUSD /** TODO: should this be liquidity or all? */}
                symbol="USD"
                variant="main16"
                compact
              />
            </TopInfoPanelItem>
            <TopInfoPanelItem title={<Trans>APY</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.supplyAPY} percent variant="main16" />
            </TopInfoPanelItem>
            {reserve.supplyCapUSD !== '0' && (
              <TopInfoPanelItem title={<Trans>Supply cap</Trans>} hideIcon variant="light">
                <FormattedNumber value={reserve.supplyCapUSD} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
            )}
          </Box>

          {renderCharts && !error && (
            <ChartContainer>
              <ParentSize>
                {(parent) => (
                  <ApyChart
                    width={parent.width}
                    height={parent.height}
                    data={data}
                    fields={[{ name: 'liquidityRate', color: '#2EBAC6', text: 'Supply APR' }]}
                  />
                )}
              </ParentSize>
            </ChartContainer>
          )}

          <Paper
            sx={{
              mt: 4,
              py: '12px',
              px: '16px',
              bgcolor: 'background.surface',
            }}
            variant="outlined"
          >
            <div>
              <Typography sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Trans>Collateral usage:</Trans>
                {reserve.usageAsCollateralEnabled ? (
                  <>
                    <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
                    <Trans>Can be collateral</Trans>
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
                flexWrap: 'wrap',
                mt: '16px',
                '& > :not(:last-child)::after': {
                  content: '""',
                  height: '16px',
                  pr: 2,
                  mr: 2,
                  borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Max LTV</Trans>
                <FormattedNumber
                  value={reserve.formattedBaseLTVasCollateral}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Liquidation threshold</Trans>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationThreshold}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Trans>Liquidation penalty</Trans>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationBonus}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
            </Box>
          </Paper>
        </Box>
      </PanelRow>

      <Divider sx={{ my: '40px' }} />

      <PanelRow>
        <PanelTitle>Borrow info</PanelTitle>
        <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              '& > :not(:last-child)::after': {
                content: '""',
                height: '32px',
                pr: 3,
                mr: 3,
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <TopInfoPanelItem title={<Trans>Total borrowed</Trans>} hideIcon variant="light">
              <FormattedNumber value={reserve.totalDebtUSD} symbol="USD" variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem
              title={
                <StableAPYTooltip
                  text={<Trans>APY, variable</Trans>}
                  key="APY_res_variable_type"
                  variant="description"
                />
              }
              hideIcon
              variant="light"
            >
              <FormattedNumber value={reserve.variableBorrowAPY} percent variant="main16" />
            </TopInfoPanelItem>
            <TopInfoPanelItem
              title={
                <StableAPYTooltip
                  text={<Trans>APY, stable</Trans>}
                  key="APY_res_stable_type"
                  variant="description"
                />
              }
              hideIcon
              variant="light"
            >
              <FormattedNumber value={reserve.stableBorrowAPY} percent variant="main16" />
            </TopInfoPanelItem>
            {reserve.borrowCapUSD !== '0' && (
              <TopInfoPanelItem title={<Trans>Borrow cap</Trans>} hideIcon variant="light">
                <FormattedNumber value={reserve.borrowCapUSD} symbol="USD" variant="main16" />
              </TopInfoPanelItem>
            )}
          </Box>
          {renderCharts && !error && (
            <ChartContainer>
              <ParentSize>
                {(parent) => (
                  <ApyChart
                    width={parent.width}
                    height={parent.height}
                    data={data}
                    fields={[
                      ...(reserve.stableBorrowRateEnabled
                        ? ([
                            {
                              name: 'stableBorrowRate',
                              color: '#0062D2',
                              text: 'Borrow APR, stable',
                            },
                          ] as const)
                        : []),
                      {
                        name: 'variableBorrowRate',
                        color: '#B6509E',
                        text: 'Borrow APR, variable',
                      },
                    ]}
                  />
                )}
              </ParentSize>
            </ChartContainer>
          )}
        </Box>
      </PanelRow>

      <Divider sx={{ my: '40px' }} />

      <PanelRow>
        <PanelTitle>Interest rate model</PanelTitle>
        <ChartContainer>
          <ParentSize>
            {(parent) => (
              <InterestRateModelChart
                width={parent.width}
                height={parent.height}
                reserve={{
                  baseStableBorrowRate: reserve.baseStableBorrowRate,
                  baseVariableBorrowRate: reserve.baseVariableBorrowRate,
                  optimalUsageRatio: reserve.optimalUsageRatio,
                  stableRateSlope1: reserve.stableRateSlope1,
                  stableRateSlope2: reserve.stableRateSlope2,
                  utilizationRate: reserve.utilizationRate,
                  variableRateSlope1: reserve.variableRateSlope1,
                  variableRateSlope2: reserve.variableRateSlope2,
                  stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
                }}
              />
            )}
          </ParentSize>
        </ChartContainer>
      </PanelRow>
    </Paper>
  );
};
