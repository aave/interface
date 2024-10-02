import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { AlertTitle, Box, Chip, Typography } from '@mui/material';
import React from 'react';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { DebtCeilingStatus } from 'src/components/caps/DebtCeilingStatus';
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapHookData } from 'src/hooks/useAssetCaps';
import { MarketDataType } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ApyGraphContainer } from './graphs/ApyGraphContainer';
import { PanelItem } from './ReservePanels';

interface SupplyInfoProps {
  reserve: ComputedReserveData;
  currentMarketData: MarketDataType;
  renderCharts: boolean;
  showSupplyCapStatus: boolean;
  supplyCap: AssetCapHookData;
  debtCeiling: AssetCapHookData;
}

export const SupplyInfo = ({
  reserve,
  currentMarketData,
  renderCharts,
  showSupplyCapStatus,
  supplyCap,
  debtCeiling,
}: SupplyInfoProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: { xs: 'wrap', mdlg: 'nowrap' },
        gap: 7,
        width: '100%',
      }}
    >
      <Box
        sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', minWidth: 400 }}
      >
        {showSupplyCapStatus ? (
          // With supply cap
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: '8.5px' }}>
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
                        variant="detail4"
                        color="text.secondary"
                      />{' '}
                      {reserve.symbol} (
                      <FormattedNumber
                        value={
                          valueToBigNumber(reserve.supplyCapUSD).toNumber() -
                          valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                        }
                        variant="detail4"
                        color="text.secondary"
                        symbol="USD"
                      />
                      ).
                    </Trans>
                  </>
                }
              />
              <PanelItem
                sx={{ ml: 3, minWidth: '168px', pr: 2 }}
                title={
                  <Box display="flex" alignItems="center">
                    <Typography color="text.mainTitle" variant="detail2">
                      <Trans>Total supplied</Trans>
                    </Typography>
                    <TextWithTooltip
                      iconSize={18}
                      event={{
                        eventName: GENERAL.TOOL_TIP,
                        eventParams: {
                          tooltip: 'Total Supply',
                          asset: reserve.underlyingAsset,
                          assetName: reserve.name,
                        },
                      }}
                    >
                      <>
                        <Trans>
                          Asset supply is limited to a certain amount to reduce protocol exposure to
                          the asset and to help manage risks involved.
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
                  <FormattedNumber
                    value={reserve.totalLiquidity}
                    variant="body6"
                    color="text.primary"
                    compact
                  />
                  <Typography
                    component="span"
                    variant="body6"
                    color="text.primary"
                    sx={{ display: 'inline-block', mx: 1 }}
                  >
                    <Trans>of</Trans>
                  </Typography>
                  <FormattedNumber value={reserve.supplyCap} variant="body6" color="text.primary" />
                </Box>
                <Box>
                  <ReserveSubheader value={reserve.totalLiquidityUSD} />
                  <Typography
                    component="div"
                    color="text.mainTitle"
                    variant="detail2"
                    sx={{ display: 'inline-block', mx: 1 }}
                  >
                    <Trans>of</Trans>
                  </Typography>
                  <ReserveSubheader value={reserve.supplyCapUSD} />
                </Box>
              </PanelItem>
            </Box>
            <PanelItem title={<Trans>APY</Trans>} sx={{ ml: 2, minWidth: '120px', pr: 2 }}>
              <FormattedNumber
                value={reserve.supplyAPY}
                percent
                variant="body6"
                color="text.primary"
              />
              <IncentivesButton
                symbol={reserve.symbol}
                incentives={reserve.aIncentivesData}
                displayBlank={true}
              />
            </PanelItem>
            {reserve.unbacked && reserve.unbacked !== '0' && (
              <PanelItem title={<Trans>Unbacked</Trans>} sx={{ ml: 2, minWidth: '168px' }}>
                <FormattedNumber
                  value={reserve.unbacked}
                  variant="body6"
                  color="text.primary"
                  symbol={reserve.name}
                />
                <ReserveSubheader value={reserve.unbackedUSD} />
              </PanelItem>
            )}
          </Box>
        ) : (
          <PanelItem
            title={
              <Box display="flex" alignItems="center">
                <Typography color="text.mainTitle" variant="detail2">
                  <Trans>Total supplied</Trans>
                </Typography>
              </Box>
            }
          >
            <FormattedNumber
              value={reserve.totalLiquidity}
              variant="body6"
              color="text.primary"
              compact
            />
            <ReserveSubheader value={reserve.totalLiquidityUSD} />
          </PanelItem>
        )}
        <div>
          {reserve.isIsolated ? (
            <Box sx={{ pt: 12, pb: 5 }}>
              <Typography variant="body6" color="text.primary" sx={{ mb: 5 }} component="div">
                <Trans>Collateral usage</Trans>
              </Typography>
              <Warning severity="error">
                <Typography variant="body6" color="text.secondary" component="div">
                  <Trans>Asset can only be used as collateral in isolation mode only.</Trans>
                </Typography>
                <Typography variant="detail4" color="text.secondary">
                  In Isolation mode you cannot supply other assets as collateral for borrowing.
                  Assets used as collateral in Isolation mode can only be borrowed to a specific
                  debt ceiling.{' '}
                  <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                    Learn more
                  </Link>
                </Typography>
              </Warning>
            </Box>
          ) : reserve.reserveLiquidationThreshold !== '0' ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', pt: 12, pb: 5, gap: '10px' }}>
              <Typography variant="body6" color="text.primary">
                <Trans>Collateral usage</Trans>
              </Typography>
              <Chip label={<Trans>Can be collateral</Trans>} color="success" variant="outlined" />
            </Box>
          ) : (
            <Box sx={{ pt: 12, pb: 5 }}>
              <Typography variant="body6" color="text.primary" sx={{ mb: 5 }} component="div">
                <Trans>Collateral usage</Trans>
              </Typography>
              <Warning severity="error" sx={{ mb: 0 }}>
                <Trans>Asset cannot be used as collateral.</Trans>
              </Warning>
            </Box>
          )}
        </div>
        {reserve.reserveLiquidationThreshold !== '0' && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <ReserveOverviewBox
              title={
                <MaxLTVTooltip
                  iconSize={18}
                  event={{
                    eventName: GENERAL.TOOL_TIP,
                    eventParams: {
                      tooltip: 'MAX LTV',
                      asset: reserve.underlyingAsset,
                      assetName: reserve.name,
                    },
                  }}
                  variant="description"
                  text={<Trans>Max LTV</Trans>}
                />
              }
            >
              <FormattedNumber
                value={reserve.formattedBaseLTVasCollateral}
                percent
                variant="body6"
                color="text.primary"
                visibleDecimals={2}
              />
            </ReserveOverviewBox>

            <ReserveOverviewBox
              title={
                <LiquidationThresholdTooltip
                  iconSize={18}
                  event={{
                    eventName: GENERAL.TOOL_TIP,
                    eventParams: {
                      tooltip: 'Liquidation threshold',
                      asset: reserve.underlyingAsset,
                      assetName: reserve.name,
                    },
                  }}
                  text={<Trans>Liquidation threshold</Trans>}
                />
              }
            >
              <FormattedNumber
                value={reserve.formattedReserveLiquidationThreshold}
                percent
                variant="body6"
                color="text.primary"
                visibleDecimals={2}
              />
            </ReserveOverviewBox>

            <ReserveOverviewBox
              title={
                <LiquidationPenaltyTooltip
                  iconSize={18}
                  event={{
                    eventName: GENERAL.TOOL_TIP,
                    eventParams: {
                      tooltip: 'Liquidation penalty',
                      asset: reserve.underlyingAsset,
                      assetName: reserve.name,
                    },
                  }}
                  text={<Trans>Liquidation penalty</Trans>}
                />
              }
            >
              <FormattedNumber
                value={reserve.formattedReserveLiquidationBonus}
                percent
                variant="body6"
                color="text.primary"
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
        {reserve.symbol == 'stETH' && (
          <Box>
            <Warning severity="info">
              <AlertTitle>
                <Trans>Staking Rewards</Trans>
              </AlertTitle>
              <Trans>
                stETH supplied as collateral will continue to accrue staking rewards provided by
                daily rebases.
              </Trans>{' '}
              <Link
                href="https://blog.lido.fi/aave-integrates-lidos-steth-as-collateral/"
                underline="always"
              >
                <Trans>Learn more</Trans>
              </Link>
            </Warning>
          </Box>
        )}
      </Box>
      {renderCharts && (reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <ApyGraphContainer
          graphKey="supply"
          reserve={reserve}
          currentMarketData={currentMarketData}
        />
      )}
    </Box>
  );
};
