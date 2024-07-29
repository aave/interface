import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MULTIPLE_MARKET_OPTIONS } from 'src/components/MarketSwitcher';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { MainLayout } from 'src/layouts/MainLayout';
import { HistoryTopPanel } from 'src/modules/history/HistoryTopPanel';
import { HistoryWrapper } from 'src/modules/history/HistoryWrapper';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

export default function History() {
  const [trackEvent, currentMarket, setCurrentMarket, currentAccount] = useRootStore((store) => [
    store.trackEvent,
    store.currentMarket,
    store.setCurrentMarket,
    store.account,
  ]);
  const { breakpoints } = useTheme();
  const upFromSm = useMediaQuery(breakpoints.up('xsm'));

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'History',
    });
  }, [trackEvent]);

  const handleUpdateEthMarket = (market: CustomMarket) => {
    setCurrentMarket(market);
  };

  return (
    <>
      <HistoryTopPanel />
      {currentAccount && MULTIPLE_MARKET_OPTIONS.includes(currentMarket) && (
        <Box pb={2} sx={{ width: upFromSm ? 'calc(50% - 8px)' : '100%' }}>
          <StyledTxModalToggleGroup
            color="secondary"
            value={currentMarket}
            exclusive
            onChange={(_, value) => handleUpdateEthMarket(value)}
          >
            <StyledTxModalToggleButton
              maxWidth="160px"
              unselectedBackgroundColor="#383D51"
              value={'proto_mainnet_v3'}
              disabled={currentMarket === 'proto_mainnet_v3'}
              // Todo tracking?
              // onClick={() =>
              //   trackEvent(WITHDRAW_MODAL.SWITCH_WITHDRAW_TYPE, { withdrawType: 'Withdraw' })
              // }
            >
              <Typography variant="buttonM">
                <Trans>Ethereum Main</Trans>
              </Typography>
            </StyledTxModalToggleButton>

            <StyledTxModalToggleButton
              maxWidth="160px"
              unselectedBackgroundColor="#383D51"
              value={'proto_lido_v3'}
              disabled={currentMarket === 'proto_lido_v3'}
              // Todo tracking?
            >
              <Typography variant="buttonM">
                <Trans>Lido</Trans>
              </Typography>
            </StyledTxModalToggleButton>
          </StyledTxModalToggleGroup>
        </Box>
      )}
      <ContentContainer>
        <HistoryWrapper />
      </ContentContainer>
    </>
  );
}

History.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
