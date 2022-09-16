import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Divider, SvgIcon, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import LightningBoltGradient from '/public/lightningBoltGradient.svg';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { CustomMarket, frozenProposalMap } from 'src/utils/marketsAndNetworksConfig';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { DebtCeilingStatus } from 'src/components/caps/DebtCeilingStatus';
import { ReserveFactorOverview } from 'src/modules/reserve-overview/ReserveFactorOverview';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { valueToBigNumber } from '@aave/math-utils';
import { ApyGraphContainer } from './graphs/ApyGraphContainer';
import { InteresetRateModelGraphContainer } from './graphs/InterestRateModelGraphContainer';
import { PanelRow, PanelTitle, PanelItem } from './ReservePanels';
import { ExternalLinkIcon } from '@heroicons/react/solid';

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const { currentNetworkConfig, currentMarketData, currentMarket } = useProtocolDataContext();
  const renderCharts = !!currentNetworkConfig.ratesHistoryApiUrl;

  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
  const showSupplyCapStatus = reserve.supplyCap && reserve.supplyCap !== '0';
  const showBorrowCapStatus = reserve.borrowCap && reserve.borrowCap !== '0';

  return (
    <Paper sx={{ py: '16px', px: '24px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb: reserve.isFrozen ? '0px' : '36px',
        }}
      >
        <Typography variant="h3">
          <Trans>Reserve status &#38; configuration</Trans>
        </Typography>
      </Box>

      {reserve.symbol === 'WETH' && currentMarket === CustomMarket.proto_mainnet && (
        <Box sx={{ mb: 10 }}>
          <Alert severity="warning">
            <Trans>
              As per the community vote, ETH borrowing on the Ethereum Market has been paused ahead
              of the merge to mitigate liquidity risk.{' '}
              <Link
                href="https://snapshot.org/#/aave.eth/proposal/0xa121311c67b7a5bbe5b8b5fe1911663a0ab94ed339a6a4b0e1b9443f670a0e97"
                underline="always"
              >
                <Trans>Learn more</Trans>
              </Link>
              {'.'}
            </Trans>
          </Alert>
        </Box>
      )}

      {reserve.isFrozen && (
        <Box>
          <Alert sx={{ mt: '16px', mb: '40px' }} severity="error">
            <Trans>
              {reserve.symbol} is frozen due to an Aave community decision.{' '}
              <Link
                href={
                  frozenProposalMap[reserve.symbol]
                    ? frozenProposalMap[reserve.symbol]
                    : 'https://app.aave.com/governance'
                }
                sx={{ textDecoration: 'underline' }}
              >
                <Trans>More details</Trans>
              </Link>
            </Trans>
          </Alert>
        </Box>
      )}

      <PanelRow>
        <PanelTitle>Supply Info</PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {showSupplyCapStatus ? (
              // With supply cap
              <>
                <CapsCircularStatus
                  value={supplyCap.percentUsed}
                  tooltipContent={
                    <>
                      <Trans>
                        Maximum amount available to supply is{' '}
                        <FormattedNumber
                          value={
                            valueToBigNumber(reserve.supplyCap).toNumber() -
                            valueToBigNumber(reserve.totalLiquidity).toNumber()
                          }
                          variant="secondary12"
                        />{' '}
                        {reserve.symbol} (
                        <FormattedNumber
                          value={
                            valueToBigNumber(reserve.supplyCapUSD).toNumber() -
                            valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                          }
                          variant="secondary12"
                          symbol="USD"
                        />
                        ).
                      </Trans>
                    </>
                  }
                />
                <PanelItem
                  title={
                    <Box display="flex" alignItems="center">
                      <Trans>Total supplied</Trans>
                      <TextWithTooltip>
                        <>
                          <Trans>
                            Asset supply is limited to a certain amount to reduce protocol exposure
                            to the asset and to help manage risks involved.
                          </Trans>{' '}
                          <Link
                            href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
                            underline="always"
                          >
                            <Trans>Learn more</Trans>
                          </Link>
                        </>
                      </TextWithTooltip>
                    </Box>
                  }
                >
                  <Box>
                    <FormattedNumber value={reserve.totalLiquidity} variant="main16" compact />
                    <Typography
                      component="span"
                      color="text.primary"
                      variant="secondary16"
                      sx={{ display: 'inline-block', mx: 1 }}
                    >
                      <Trans>of</Trans>
                    </Typography>
                    <FormattedNumber value={reserve.supplyCap} variant="main16" />
                  </Box>
                  <Box>
                    <ReserveSubheader value={reserve.totalLiquidityUSD} />
                    <Typography
                      component="span"
                      color="text.secondary"
                      variant="secondary12"
                      sx={{ display: 'inline-block', mx: 1 }}
                    >
                      <Trans>of</Trans>
                    </Typography>
                    <ReserveSubheader value={reserve.supplyCapUSD} />
                  </Box>
                </PanelItem>
              </>
            ) : (
              // Without supply cap
              <PanelItem
                title={
                  <Box display="flex" alignItems="center">
                    <Trans>Total supplied</Trans>
                  </Box>
                }
              >
                <FormattedNumber value={reserve.totalLiquidity} variant="main16" compact />
                <ReserveSubheader value={reserve.totalLiquidityUSD} />
              </PanelItem>
            )}
            <PanelItem title={<Trans>APY</Trans>}>
              <FormattedNumber value={reserve.supplyAPY} percent variant="main16" />
              <IncentivesButton
                symbol={reserve.symbol}
                incentives={reserve.aIncentivesData}
                displayBlank={true}
              />
            </PanelItem>
            {reserve.unbacked && reserve.unbacked !== '0' && (
              <PanelItem title={<Trans>Unbacked</Trans>}>
                <FormattedNumber value={reserve.unbacked} variant="main16" symbol={reserve.name} />
                <ReserveSubheader value={reserve.unbackedUSD} />
              </PanelItem>
            )}
          </Box>
          {renderCharts && (reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
            <ApyGraphContainer
              graphKey="supply"
              reserve={reserve}
              lendingPoolAddressProvider={currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}
            />
          )}
          <div>
            {reserve.isIsolated ? (
              <Box sx={{ pt: '42px', pb: '12px' }}>
                <Typography variant="subheader1" color="text.main" paddingBottom={'12px'}>
                  <Trans>Collateral usage</Trans>
                </Typography>
                <Alert severity="warning">
                  <Typography variant="subheader1">
                    <Trans>Asset can only be used as collateral in isolation mode only.</Trans>
                  </Typography>
                  <Typography variant="caption">
                    In Isolation mode you cannot supply other assets as collateral for borrowing.
                    Assets used as collateral in Isolation mode can only be borrowed to a specific
                    debt ceiling.{' '}
                    <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                      Learn more
                    </Link>
                  </Typography>
                </Alert>
              </Box>
            ) : reserve.usageAsCollateralEnabled ? (
              <Box
                sx={{ display: 'inline-flex', alignItems: 'center', pt: '42px', pb: '12px' }}
                paddingTop={'42px'}
              >
                <Typography variant="subheader1" color="text.main">
                  <Trans>Collateral usage</Trans>
                </Typography>
                <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
                <Typography variant="subheader1" sx={{ color: '#46BC4B' }}>
                  <Trans>Can be collateral</Trans>
                </Typography>
              </Box>
            ) : (
              <Box sx={{ pt: '42px', pb: '12px' }}>
                <Typography variant="subheader1" color="text.main">
                  <Trans>Collateral usage</Trans>
                </Typography>
                <Alert sx={{ my: '12px' }} severity="warning">
                  <Trans>Asset cannot be used as collateral.</Trans>
                </Alert>
              </Box>
            )}
          </div>
          {reserve.usageAsCollateralEnabled && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <ReserveOverviewBox
                title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
              >
                <FormattedNumber
                  value={reserve.formattedBaseLTVasCollateral}
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
                  value={reserve.formattedReserveLiquidationThreshold}
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
                  value={reserve.formattedReserveLiquidationBonus}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>

              {reserve.isIsolated && (
                <ReserveOverviewBox fullWidth>
                  <DebtCeilingStatus
                    debt={reserve.isolationModeTotalDebtUSD}
                    ceiling={reserve.debtCeilingUSD}
                    usageData={debtCeiling}
                  />
                </ReserveOverviewBox>
              )}
            </Box>
          )}
        </Box>
      </PanelRow>

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <Divider sx={{ my: '40px' }} />
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
                {showBorrowCapStatus ? (
                  // With a borrow cap
                  <>
                    <CapsCircularStatus
                      value={borrowCap.percentUsed}
                      tooltipContent={
                        <>
                          <Trans>
                            Maximum amount available to supply is{' '}
                            <FormattedNumber
                              value={
                                valueToBigNumber(reserve.borrowCap).toNumber() -
                                valueToBigNumber(reserve.totalDebt).toNumber()
                              }
                              variant="secondary12"
                            />{' '}
                            {reserve.symbol} (
                            <FormattedNumber
                              value={
                                valueToBigNumber(reserve.borrowCapUSD).toNumber() -
                                valueToBigNumber(reserve.totalDebtUSD).toNumber()
                              }
                              variant="secondary12"
                              symbol="USD"
                            />
                            ).
                          </Trans>
                        </>
                      }
                    />
                    <PanelItem
                      title={
                        <Box display="flex" alignItems="center">
                          <Trans>Total borrowed</Trans>
                          <TextWithTooltip>
                            <>
                              <Trans>
                                Borrowing of this asset is limited to a certain amount to minimize
                                liquidity pool insolvency.
                              </Trans>{' '}
                              <Link
                                href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
                                underline="always"
                              >
                                <Trans>Learn more</Trans>
                              </Link>
                            </>
                          </TextWithTooltip>
                        </Box>
                      }
                    >
                      <Box>
                        <FormattedNumber value={reserve.totalDebt} variant="main16" />
                        <Typography
                          component="span"
                          color="text.primary"
                          variant="secondary16"
                          sx={{ display: 'inline-block', mx: 1 }}
                        >
                          <Trans>of</Trans>
                        </Typography>
                        <FormattedNumber value={reserve.borrowCap} variant="main16" />
                      </Box>
                      <Box>
                        <ReserveSubheader value={reserve.totalDebtUSD} />
                        <Typography
                          component="span"
                          color="text.primary"
                          variant="secondary16"
                          sx={{ display: 'inline-block', mx: 1 }}
                        >
                          <Trans>of</Trans>
                        </Typography>
                        <ReserveSubheader value={reserve.borrowCapUSD} />
                      </Box>
                    </PanelItem>
                  </>
                ) : (
                  // Without a borrow cap
                  <PanelItem
                    title={
                      <Box display="flex" alignItems="center">
                        <Trans>Total borrowed</Trans>
                      </Box>
                    }
                  >
                    <FormattedNumber value={reserve.totalDebt} variant="main16" />
                    <ReserveSubheader value={reserve.totalDebtUSD} />
                  </PanelItem>
                )}
                <PanelItem
                  title={
                    <VariableAPYTooltip
                      text={<Trans>APY, variable</Trans>}
                      key="APY_res_variable_type"
                      variant="description"
                    />
                  }
                >
                  <FormattedNumber value={reserve.variableBorrowAPY} percent variant="main16" />
                  <IncentivesButton
                    symbol={reserve.symbol}
                    incentives={reserve.vIncentivesData}
                    displayBlank={true}
                  />
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
                    <IncentivesButton
                      symbol={reserve.symbol}
                      incentives={reserve.sIncentivesData}
                      displayBlank={true}
                    />
                  </PanelItem>
                )}
                {reserve.borrowCapUSD && reserve.borrowCapUSD !== '0' && (
                  <PanelItem title={<Trans>Borrow cap</Trans>}>
                    <FormattedNumber value={reserve.borrowCap} variant="main16" />
                    <ReserveSubheader value={reserve.borrowCapUSD} />
                  </PanelItem>
                )}
              </Box>
              {renderCharts && (
                <ApyGraphContainer
                  graphKey="borrow"
                  reserve={reserve}
                  lendingPoolAddressProvider={
                    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
                  }
                />
              )}
              <Box
                sx={{ display: 'inline-flex', alignItems: 'center', pt: '42px', pb: '12px' }}
                paddingTop={'42px'}
              >
                <Typography variant="subheader1" color="text.main">
                  <Trans>Collector Info</Trans>
                </Typography>
              </Box>
              {currentMarketData.addresses.COLLECTOR && (
                <ReserveFactorOverview
                  collectorContract={currentMarketData.addresses.COLLECTOR}
                  explorerLinkBuilder={currentNetworkConfig.explorerLinkBuilder}
                  reserveFactor={reserve.reserveFactor}
                />
              )}
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
                <PanelItem title={<Trans>Utilization Rate</Trans>}>
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
              <InteresetRateModelGraphContainer reserve={reserve} />
            </Box>
          </PanelRow>
        </>
      )}
    </Paper>
  );
};
