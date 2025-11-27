import { ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { AlertTitle, Box, Typography } from '@mui/material';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { DebtCeilingStatus } from 'src/components/caps/DebtCeilingStatus';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { IncentivesCard } from 'src/components/incentives/IncentivesCard';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapHookData } from 'src/hooks/useAssetCapsSDK';
import { GENERAL } from 'src/utils/events';
import { MarketDataType } from 'src/utils/marketsAndNetworksConfig';

import { SupplyApyGraph } from './graphs/ApyGraphContainer';
import { PanelItem } from './ReservePanels';

interface SupplyInfoProps {
  reserve: ReserveWithId;
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
  const supplyProtocolIncentives = mapAaveProtocolIncentives(reserve.incentives, 'supply');
  return (
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
                        valueToBigNumber(reserve.supplyInfo.supplyCap.amount.value).toNumber() -
                        valueToBigNumber(reserve.supplyInfo.total.value).toNumber()
                      }
                      variant="secondary12"
                    />{' '}
                    {reserve.underlyingToken.symbol} (
                    <FormattedNumber
                      value={
                        valueToBigNumber(reserve.supplyInfo.supplyCap.usd).toNumber() -
                        valueToBigNumber(reserve.size.usd).toNumber()
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
                  <TextWithTooltip
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: {
                        tooltip: 'Total Supply',
                        asset: reserve.underlyingToken.address,
                        assetName: reserve.underlyingToken.name,
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
                <FormattedNumber value={reserve.supplyInfo.total.value} variant="main16" compact />
                <Typography
                  component="span"
                  color="text.primary"
                  variant="secondary16"
                  sx={{ display: 'inline-block', mx: 1 }}
                >
                  <Trans>of</Trans>
                </Typography>
                <FormattedNumber
                  value={reserve.supplyInfo.supplyCap.amount.value}
                  variant="main16"
                />
              </Box>
              <Box>
                <ReserveSubheader value={reserve.size.usd} />
                <Typography
                  component="span"
                  color="text.secondary"
                  variant="secondary12"
                  sx={{ display: 'inline-block', mx: 1 }}
                >
                  <Trans>of</Trans>
                </Typography>
                <ReserveSubheader value={reserve.supplyInfo.supplyCap.usd} />
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
            <FormattedNumber value={reserve.supplyInfo.total.value} variant="main16" compact />
            <ReserveSubheader value={reserve.size.usd} />
          </PanelItem>
        )}
        <PanelItem title={<Trans>APY</Trans>}>
          <IncentivesCard
            value={reserve.supplyInfo.apy.value}
            incentives={supplyProtocolIncentives}
            address={reserve.aToken.address}
            symbol={reserve.underlyingToken.symbol}
            variant="main16"
            market={currentMarketData.market}
            protocolAction={ProtocolAction.supply}
            inlineIncentives={true}
          />
        </PanelItem>
      </Box>
      {renderCharts &&
        (reserve.borrowInfo?.borrowingState === 'ENABLED' ||
          Number(reserve.borrowInfo?.total.amount.value) > 0) && (
          <SupplyApyGraph
            chain={currentMarketData.chainId}
            underlyingToken={reserve.underlyingToken.address}
            market={currentMarketData.addresses.LENDING_POOL}
          />
        )}
      <div>
        {reserve.isolationModeConfig?.canBeCollateral ? (
          <Box sx={{ pt: '42px', pb: '12px' }}>
            <Typography variant="subheader1" color="text.main" paddingBottom={'12px'}>
              <Trans>Collateral usage</Trans>
            </Typography>
            <Warning severity="warning">
              <Typography variant="subheader1">
                <Trans>Asset can only be used as collateral in isolation mode only.</Trans>
              </Typography>
              <Typography variant="caption">
                In Isolation mode you cannot supply other assets as collateral for borrowing. Assets
                used as collateral in Isolation mode can only be borrowed to a specific debt
                ceiling.{' '}
                <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                  Learn more
                </Link>
              </Typography>
            </Warning>
          </Box>
        ) : reserve.supplyInfo.liquidationThreshold.value !== '0' ? (
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
            <Warning sx={{ my: '12px' }} severity="warning">
              <Trans>Asset cannot be used as collateral.</Trans>
            </Warning>
          </Box>
        )}
      </div>
      {reserve.supplyInfo.liquidationThreshold.value !== '0' && (
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
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: {
                    tooltip: 'MAX LTV',
                    asset: reserve.underlyingToken.address,
                    assetName: reserve.underlyingToken.name,
                  },
                }}
                variant="description"
                text={<Trans>Max LTV</Trans>}
              />
            }
          >
            <FormattedNumber
              value={reserve.supplyInfo.maxLTV.value}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          <ReserveOverviewBox
            title={
              <LiquidationThresholdTooltip
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: {
                    tooltip: 'Liquidation threshold',
                    asset: reserve.supplyInfo.liquidationThreshold.value,
                    assetName: reserve.underlyingToken.name,
                  },
                }}
                variant="description"
                text={<Trans>Liquidation threshold</Trans>}
              />
            }
          >
            <FormattedNumber
              value={reserve.supplyInfo.liquidationThreshold.value}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          <ReserveOverviewBox
            title={
              <LiquidationPenaltyTooltip
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: {
                    tooltip: 'Liquidation penalty',
                    asset: reserve.supplyInfo.liquidationBonus.value,
                    assetName: reserve.underlyingToken.name,
                  },
                }}
                variant="description"
                text={<Trans>Liquidation penalty</Trans>}
              />
            }
          >
            <FormattedNumber
              value={reserve.supplyInfo.liquidationBonus.value}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          {reserve.isolationModeConfig?.canBeCollateral && (
            <ReserveOverviewBox fullWidth>
              <DebtCeilingStatus
                debt={reserve.isolationModeConfig.totalBorrows.usd}
                ceiling={reserve.isolationModeConfig.debtCeiling.usd}
                usageData={debtCeiling}
              />
            </ReserveOverviewBox>
          )}
        </Box>
      )}
      {reserve.underlyingToken.symbol == 'stETH' && (
        <Box>
          <Warning severity="info">
            <AlertTitle>
              <Trans>Staking Rewards</Trans>
            </AlertTitle>
            <Trans>
              stETH supplied as collateral will continue to accrue staking rewards provided by daily
              rebases.
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
  );
};
