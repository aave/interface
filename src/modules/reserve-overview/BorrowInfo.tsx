import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapHookData } from 'src/hooks/useAssetCaps';
import { MarketDataType, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ApyGraphContainer } from './graphs/ApyGraphContainer';
import { ReserveFactorOverview } from './ReserveFactorOverview';
import { PanelItem } from './ReservePanels';

interface BorrowInfoProps {
  reserve: ComputedReserveData;
  currentMarketData: MarketDataType;
  currentNetworkConfig: NetworkConfig;
  renderCharts: boolean;
  showBorrowCapStatus: boolean;
  borrowCap: AssetCapHookData;
}

export const BorrowInfo = ({
  reserve,
  currentMarketData,
  currentNetworkConfig,
  renderCharts,
  showBorrowCapStatus,
  borrowCap,
}: BorrowInfoProps) => {
  return (
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
                  <TextWithTooltip
                    event={{
                      eventName: GENERAL.TOOL_TIP,
                      eventParams: {
                        tooltip: 'Total borrowed',
                        asset: reserve.underlyingAsset,
                        assetName: reserve.name,
                      },
                    }}
                  >
                    <>
                      <Trans>
                        Borrowing of this asset is limited to a certain amount to minimize liquidity
                        pool insolvency.
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
              event={{
                eventName: GENERAL.TOOL_TIP,
                eventParams: {
                  tooltip: 'APY, variable',
                  asset: reserve.underlyingAsset,
                  assetName: reserve.name,
                },
              }}
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
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: {
                    tooltip: 'APY, stable',
                    asset: reserve.underlyingAsset,
                    assetName: reserve.name,
                  },
                }}
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
          currentMarketData={currentMarketData}
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
          reserveName={reserve.name}
          reserveAsset={reserve.underlyingAsset}
        />
      )}
    </Box>
  );
};
