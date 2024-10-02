import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import React from 'react';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
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
  const { isConnectNetWorkTon } = useAppDataContext();

  const collectorContract = isConnectNetWorkTon
    ? reserve.underlyingAssetTon
    : currentMarketData.addresses.COLLECTOR;

  const maxAvailableToBorrow = BigNumber.max(
    valueToBigNumber(reserve.borrowCap).minus(valueToBigNumber(reserve.totalDebt)),
    0
  ).toNumber();

  const maxAvailableToBorrowUSD = BigNumber.max(
    valueToBigNumber(reserve.borrowCapUSD).minus(valueToBigNumber(reserve.totalDebtUSD)),
    0
  ).toNumber();
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
        {showBorrowCapStatus ? (
          // With a borrow cap
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: '8.5px' }}>
              <CapsCircularStatus
                value={borrowCap.percentUsed}
                tooltipContent={
                  <>
                    <Trans>
                      Maximum amount available to borrow is{' '}
                      <FormattedNumber
                        value={maxAvailableToBorrow}
                        variant="detail4"
                        color="text.secondary"
                      />{' '}
                      {reserve.symbol} (
                      <FormattedNumber
                        value={maxAvailableToBorrowUSD}
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
                      <Trans>Total borrowed</Trans>
                    </Typography>
                    <TextWithTooltip
                      iconSize={18}
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
                  <FormattedNumber
                    value={reserve.totalDebt}
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
                  <FormattedNumber value={reserve.borrowCap} variant="body6" color="text.primary" />
                </Box>
                <Box>
                  <ReserveSubheader value={reserve.totalDebtUSD} />
                  <Typography
                    component="div"
                    color="text.mainTitle"
                    variant="detail2"
                    sx={{ display: 'inline-block', mx: 1 }}
                  >
                    <Trans>of</Trans>
                  </Typography>
                  <ReserveSubheader value={reserve.borrowCapUSD} />
                </Box>
              </PanelItem>
            </Box>
            <PanelItem
              sx={{ ml: 2, minWidth: '150px', pr: 2 }}
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
              <FormattedNumber
                value={reserve.variableBorrowAPY}
                percent
                variant="body6"
                color="text.primary"
              />
              <IncentivesButton
                symbol={reserve.symbol}
                incentives={reserve.vIncentivesData}
                displayBlank={true}
              />
            </PanelItem>
            {reserve.borrowCapUSD && reserve.borrowCapUSD !== '0' && (
              <PanelItem title={<Trans>Borrow cap</Trans>} sx={{ ml: 2 }}>
                <FormattedNumber value={reserve.borrowCap} variant="body6" color="text.primary" />
                <ReserveSubheader value={reserve.borrowCapUSD} />
              </PanelItem>
            )}
          </Box>
        ) : (
          // Without a borrow cap
          <PanelItem
            title={
              <Box display="flex" alignItems="center">
                <Typography color="text.mainTitle" variant="detail2">
                  <Trans>Total borrowed</Trans>
                </Typography>
              </Box>
            }
          >
            <FormattedNumber value={reserve.totalDebt} variant="body6" color="text.primary" />
            <ReserveSubheader value={reserve.totalDebtUSD} />
          </PanelItem>
        )}

        {/* {reserve.stableBorrowRateEnabled && (
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
        )} */}
        <Box sx={{ pt: 12, pb: 5 }}>
          <Typography variant="body6" color="text.primary" sx={{ mb: 5 }} component="div">
            <Trans>Collector Info</Trans>
          </Typography>
        </Box>
        {collectorContract && (
          <ReserveFactorOverview
            collectorContract={collectorContract}
            explorerLinkBuilder={currentNetworkConfig.explorerLinkBuilder}
            reserveFactor={reserve.reserveFactor}
            reserveName={reserve.name}
            reserveAsset={reserve.underlyingAsset}
          />
        )}
      </Box>
      {renderCharts && (
        <ApyGraphContainer
          graphKey="borrow"
          reserve={reserve}
          currentMarketData={currentMarketData}
        />
      )}
    </Box>
  );
};
