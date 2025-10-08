import { AaveV2Ethereum } from '@bgd-labs/aave-address-book';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, SvgIcon } from '@mui/material';
import { getFrozenProposalLink } from 'src/components/infoTooltips/FrozenTooltip';
import { PausedTooltipText } from 'src/components/infoTooltips/PausedTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import { BorrowDisabledWarning } from 'src/components/Warnings/BorrowDisabledWarning';
import {
  AssetsBeingOffboarded,
  OffboardingWarning,
} from 'src/components/Warnings/OffboardingWarning';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { BorrowInfo } from './BorrowInfo';
import { InterestRateModelGraphContainer } from './graphs/InterestRateModelGraphContainer';
import { ReserveEModePanel } from './ReserveEModePanel';
import { PanelItem, PanelRow, PanelTitle } from './ReservePanels';
import { SupplyInfo } from './SupplyInfo';

/**
 * Broken Assets:
 * A list of assets that currently are broken in some way, i.e. has bad data from either the subgraph or backend server
 * Each item represents the ID of the asset, not the underlying address it's deployed to, appended with LendingPoolAddressProvider
 * contract address it is held in. So each item in the array is essentially [underlyingAssetId + LendingPoolAddressProvider address].
 */
const BROKEN_ASSETS = [
  // ampl https://governance.aave.com/t/arc-fix-ui-bugs-in-reserve-overview-for-ampl/5885/5?u=sakulstra
  AaveV2Ethereum.ASSETS.AMPL.UNDERLYING.toLowerCase(),
  AaveV2Ethereum.ASSETS.FEI.UNDERLYING.toLowerCase(),
];

type ReserveConfigurationProps = {
  reserve: ReserveWithId;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const [trackEvent, currentNetworkConfig, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [
      store.trackEvent,
      store.currentNetworkConfig,
      store.currentMarketData,
      store.currentMarket,
    ])
  );
  const renderCharts = !BROKEN_ASSETS.includes(reserve.underlyingToken.address);
  const { supplyCap, borrowCap, debtCeiling } = useAssetCapsSDK();
  const showSupplyCapStatus: boolean = reserve.supplyInfo.supplyCap.amount.value !== '0';
  const showBorrowCapStatus: boolean = reserve.borrowInfo?.borrowCap.amount.value !== '0';

  const offboardingDiscussion =
    AssetsBeingOffboarded[currentMarket]?.[reserve.underlyingToken.symbol];

  return (
    <>
      <Box>
        {reserve.isFrozen && !offboardingDiscussion ? (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
            <Trans>
              This asset is frozen due to an Aave community decision.{' '}
              <Link
                href={getFrozenProposalLink(
                  reserve.underlyingToken.symbol.toLocaleLowerCase(),
                  currentMarket
                )}
                sx={{ textDecoration: 'underline' }}
              >
                <Trans>More details</Trans>
              </Link>
            </Trans>
          </Warning>
        ) : offboardingDiscussion ? (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
            <OffboardingWarning discussionLink={offboardingDiscussion} />
          </Warning>
        ) : (
          reserve.underlyingToken.symbol == 'AMPL' && (
            <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
              <AMPLWarning />
            </Warning>
          )
        )}

        {reserve.isPaused ? (
          reserve.underlyingToken.symbol === 'MAI' ? (
            <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
              <Trans>
                MAI has been paused due to a community decision. Supply, borrows and repays are
                impacted.{' '}
                <Link
                  href={
                    'https://governance.aave.com/t/arfc-add-mai-to-arbitrum-aave-v3-market/12759/8'
                  }
                  sx={{ textDecoration: 'underline' }}
                >
                  <Trans>More details</Trans>
                </Link>
              </Trans>
            </Warning>
          ) : (
            <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
              <PausedTooltipText />
            </Warning>
          )
        ) : null}
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

      {(reserve.borrowInfo?.borrowingState === 'ENABLED' ||
        Number(reserve.borrowInfo?.total.amount.value) > 0) && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <PanelRow>
            <PanelTitle>Borrow info</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              {reserve.borrowInfo?.borrowingState === 'DISABLED' && (
                <Warning sx={{ mb: '40px' }} severity="error">
                  <BorrowDisabledWarning
                    symbol={reserve.underlyingToken.symbol}
                    currentMarket={currentMarket}
                  />
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

      {reserve.eModeInfo?.length > 0 && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <ReserveEModePanel reserve={reserve} />
        </>
      )}

      {(reserve.borrowInfo?.borrowingState === 'ENABLED' ||
        Number(reserve.borrowInfo?.total.amount.value) > 0) && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />

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
                    value={reserve.borrowInfo!.utilizationRate.value}
                    percent
                    variant="main16"
                    compact
                  />
                </PanelItem>
                <Button
                  onClick={() => {
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      asset: reserve.underlyingToken.address,
                      Link: 'Interest Rate Strategy',
                      assetName: reserve.underlyingToken.name,
                    });
                  }}
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
    </>
  );
};
