import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Box, Button, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { ROUTES } from 'src/components/primitives/Link';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { getMarketHelpData } from 'src/helpers/get-market-help-data';

import { getMarketInfoById, MarketLogo } from '../../components/MarketSwitcher';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';

export const MigrationTopPanel = () => {
  const router = useRouter();
  const { currentMarket } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);
  const marketNaming = getMarketHelpData(market.marketTitle);

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: downToSM ? 'flex-start' : 'center',
              alignSelf: downToSM ? 'flex-start' : 'center',
              mb: 4,
              minHeight: '40px',
              flexDirection: downToSM ? 'column' : 'row',
            }}
          >
            <Button
              variant="surface"
              size="medium"
              color="primary"
              startIcon={
                <SvgIcon sx={{ fontSize: '20px' }}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => {
                router.push(ROUTES.dashboard);
              }}
              sx={{ mr: 3, mb: downToSM ? '24px' : '0' }}
              data-cy={`goBack-btn`}
            >
              <Trans>Go Back</Trans>
            </Button>
          </Box>
          <PageTitle
            pageTitle={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MarketLogo
                  size={32}
                  logo={network.networkLogoPath}
                  testChainName={marketNaming.testChainName}
                />
                <Trans>Migrate to {market.marketTitle} v3 Market</Trans>
              </Box>
            }
          />
        </Box>
      }
    />
  );
};
