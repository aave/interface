import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import { Box, Button, Divider, SvgIcon, Typography } from '@mui/material';
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
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { BROKEN_ASSETS } from 'src/hooks/useReservesHistory';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { BorrowInfo } from './BorrowInfo';
import { InterestRateModelGraphContainer } from './graphs/InterestRateModelGraphContainer';
import { ReserveEModePanel } from './ReserveEModePanel';
import { PanelItem, PanelRow, PanelTitle } from './ReservePanels';
import { SupplyInfo } from './SupplyInfo';

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const { currentNetworkConfig, currentMarketData, currentMarket } = useProtocolDataContext();
  const reserveId =
    reserve.underlyingAsset + currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  const renderCharts = !currentMarketData.disableCharts && !BROKEN_ASSETS.includes(reserveId);
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
  const showSupplyCapStatus: boolean = reserve.supplyCap !== '0';
  const showBorrowCapStatus: boolean = reserve.borrowCap !== '0';
  const trackEvent = useRootStore((store) => store.trackEvent);

  const offboardingDiscussion = AssetsBeingOffboarded[currentMarket]?.[reserve.symbol];

  return (
    <>
      <Box>
        {reserve.isFrozen && !offboardingDiscussion ? (
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
        ) : offboardingDiscussion ? (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="error">
            <OffboardingWarning discussionLink={offboardingDiscussion} />
          </Warning>
        ) : (
          reserve.symbol == 'AMPL' && (
            <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
              <AMPLWarning />
            </Warning>
          )
        )}

        {reserve.isPaused ? (
          reserve.symbol === 'MAI' ? (
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
      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <PanelRow sx={{ mt: { xs: 6, sm: 10 } }}>
            <PanelTitle> Borrow info</PanelTitle>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              {/*{reserve.borrowingEnabled && (*/}
              {/*  <Warning sx={{ mb: '40px' }} severity="error">*/}
              {/*    <BorrowDisabledWarning symbol={reserve.symbol} currentMarket={currentMarket} />*/}
              {/*  </Warning>*/}
              {/*)}*/}
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

      {/*{reserve.eModeCategoryId !== 0 && (*/}
      {/*  <>*/}
      {/*    <Box sx={{ mt: { xs: 6, sm: 10 } }} />*/}
      {/*    <ReserveEModePanel reserve={reserve} />*/}
      {/*  </>*/}
      {/*)}*/}

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <PanelRow sx={{ mt: { xs: 6, sm: 10 } }}>
            <PanelTitle>Interest rate model</PanelTitle>
            <Box
              sx={{
                display: 'flex',
                flexWrap: { xs: 'wrap', mdlg: 'nowrap' },
                gap: 7,
                width: '100%',
              }}
            >
              <Box sx={{ flex: 1, height: '100%', display: 'flex', minWidth: 400 }}>
                <PanelItem
                  sx={{ minWidth: '150px' }}
                  title={
                    <Typography color="text.mainTitle" variant="detail2">
                      <Trans>Utilization Rate</Trans>
                    </Typography>
                  }
                >
                  <FormattedNumber
                    value={reserve.borrowUsageRatio}
                    percent
                    variant="body6"
                    color="text.primary"
                    compact
                  />
                </PanelItem>
                <Button
                  onClick={() => {
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      asset: reserve.underlyingAsset,
                      Link: 'Interest Rate Strategy',
                      assetName: reserve.name,
                    });
                  }}
                  href={currentNetworkConfig.explorerLinkBuilder({
                    address: reserve.interestRateStrategyAddress,
                  })}
                  endIcon={
                    <SvgIcon sx={{ width: 14, height: 14 }}>
                      <CallMadeOutlinedIcon />
                    </SvgIcon>
                  }
                  component={Link}
                  size="small"
                  variant="text"
                  sx={(theme) => ({
                    height: '24px',
                    color: theme.palette.text.secondary,
                    ...theme.typography.detail2,
                    textTransform: 'uppercase',
                    px: 2,
                  })}
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
