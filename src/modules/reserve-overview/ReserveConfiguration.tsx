import React, { ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  Divider,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Paper from '@mui/material/Paper';
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
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { ExclamationIcon } from '@heroicons/react/outline';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      display: { xs: 'block', md: 'flex' },
      margin: '0 auto',
      ...props.sx,
    }}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  <Typography
    {...props}
    variant="subheader1"
    sx={{ minWidth: { xs: '170px' }, mr: 4, mb: { xs: 6, md: 0 }, ...props.sx }}
  />
);

interface PanelItemProps {
  title: ReactNode;
}

export const PanelItem: React.FC<PanelItemProps> = ({ title, children }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 4,
        '&:not(:last-child)': {
          pr: 4,
          mr: 4,
        },
        ...(mdUp
          ? {
              '&:not(:last-child)::after': {
                content: '""',
                height: '32px',
                position: 'absolute',
                right: 4,
                top: 'calc(50% - 17px)',
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }
          : {}),
      }}
    >
      <Typography color="text.secondary">{title}</Typography>
      {children}
    </Box>
  );
};

const ChartContainer: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      minWidth: 0,
      width: '100%',
      maxWidth: '100%',
      height: 300,
      marginLeft: 0,
      flexGrow: 1,
      ...props.sx,
    }}
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
        <Box sx={{ minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <PanelItem title={<Trans>Total supplied</Trans>}>
              <FormattedNumber
                value={reserve.totalLiquidityUSD /** TODO: should this be liquidity or all? */}
                symbol="USD"
                variant="main16"
                compact
              />
            </PanelItem>
            <PanelItem title={<Trans>APY</Trans>}>
              <FormattedNumber value={reserve.supplyAPY} percent variant="main16" sx={{ mr: 3 }} />
              <IncentivesButton symbol={reserve.symbol} incentives={reserve.aIncentivesData} />
            </PanelItem>
            {reserve.supplyCapUSD !== '0' && (
              <PanelItem title={<Trans>Supply cap</Trans>}>
                <FormattedNumber value={reserve.totalLiquidity} variant="main16" /> of{' '}
                <FormattedNumber value={reserve.supplyCap} variant="main16" />
              </PanelItem>
            )}
            {reserve.unbacked !== '0' && (
              <PanelItem title={<Trans>Unbacked</Trans>}>
                <FormattedNumber
                  value={reserve.unbacked}
                  variant="main16"
                  symbol={reserve.symbol}
                />
              </PanelItem>
            )}
          </Box>

          {renderCharts && !error && (
            <ChartContainer sx={{ mt: 4 }}>
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

          <Box
            sx={{
              mt: 4,
              py: '12px',
              px: '16px',
              bgcolor: 'background.default',
              borderRadius: '6px',
            }}
          >
            <div>
              {!reserve.isIsolated && (
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
              )}
              {reserve.isIsolated && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    bgcolor: 'warning.main',
                    p: '4px 8px',
                    color: '#fff',
                    borderRadius: '6px',
                  }}
                >
                  <ExclamationIcon style={{ height: 16, paddingRight: '4px' }} />
                  Can be collateral in isolation mode
                </Box>
              )}
            </div>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexWrap: 'wrap',
                mt: '16px',
                '& > :not(:last-child)': {
                  mr: 4,
                },
              }}
            >
              <Typography sx={{ display: 'inline-flex' }}>
                <Typography sx={{ color: 'text.muted' }} component="span">
                  <Trans>Max LTV</Trans>
                </Typography>
                <FormattedNumber
                  value={reserve.formattedBaseLTVasCollateral}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Typography sx={{ color: 'text.muted' }} component="span">
                  <Trans>Liquidation threshold</Trans>
                </Typography>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationThreshold}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
              <Typography sx={{ display: 'inline-flex' }}>
                <Typography sx={{ color: 'text.muted' }} component="span">
                  <Trans>Liquidation penalty</Trans>
                </Typography>
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationBonus}
                  percent
                  variant="secondary14"
                  sx={{ ml: 2 }}
                  visibleDecimals={0}
                />
              </Typography>
              {reserve.isIsolated && (
                <Typography sx={{ display: 'inline-flex' }}>
                  <Typography sx={{ color: 'text.muted' }} component="span">
                    <Trans>Debt ceiling</Trans>
                  </Typography>
                  <FormattedNumber
                    value={reserve.isolationModeTotalDebtUSD}
                    variant="secondary14"
                    sx={{ ml: 2 }}
                    symbol="USD"
                    visibleDecimals={0}
                  />
                  &nbsp;of
                  <FormattedNumber
                    value={reserve.debtCeilingUSD}
                    variant="secondary14"
                    sx={{ ml: 2 }}
                    symbol="USD"
                    visibleDecimals={0}
                  />
                </Typography>
              )}
              {reserve.isIsolated && (
                <Typography variant="caption" sx={{ mt: 2 }}>
                  <Trans>
                    In Isolation mode you cannot supply other assets as collateral for borrowing.
                    Assets used as collateral in Isolation mode can only be borrowed to a specific
                    debt ceiling.
                  </Trans>
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </PanelRow>

      <Divider sx={{ my: '40px' }} />

      {reserve.borrowingEnabled && (
        <PanelRow>
          <PanelTitle>Borrow info</PanelTitle>
          <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <PanelItem title={<Trans>Total borrowed</Trans>}>
                <FormattedNumber value={reserve.totalDebtUSD} symbol="USD" variant="main16" />
              </PanelItem>
              <PanelItem
                title={
                  <StableAPYTooltip
                    text={<Trans>APY, variable</Trans>}
                    key="APY_res_variable_type"
                    variant="description"
                  />
                }
              >
                <FormattedNumber value={reserve.variableBorrowAPY} percent variant="main16" />
              </PanelItem>
              {reserve.stableBorrowRateEnabled && (
                <PanelItem
                  title={
                    <StableAPYTooltip
                      text={<Trans>APY, stable</Trans>}
                      key="APY_res_stable_type"
                      variant="description"
                    />
                  }
                >
                  <FormattedNumber value={reserve.stableBorrowAPY} percent variant="main16" />
                </PanelItem>
              )}
              {reserve.borrowCapUSD !== '0' && (
                <PanelItem title={<Trans>Borrow cap</Trans>}>
                  <FormattedNumber value={reserve.totalDebt} variant="main16" /> of
                  <FormattedNumber value={reserve.borrowCap} variant="main16" />
                </PanelItem>
              )}
            </Box>
            {renderCharts && !error && (
              <ChartContainer sx={{ mt: 8 }}>
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
      )}

      {reserve.borrowingEnabled && (
        <>
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
        </>
      )}
    </Paper>
  );
};
