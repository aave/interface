import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Box, Button, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { ROUTES } from 'src/components/primitives/Link';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

import { getMarketInfoById } from '../../components/MarketSwitcher';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';

export const MigrationTopPanel = () => {
  const router = useRouter();
  const { currentMarket } = useProtocolDataContext();
  const { market } = getMarketInfoById(currentMarket);

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
            >
              <Trans>Go Back</Trans>
            </Button>
          </Box>
          <PageTitle
            pageTitle={
              <Trans>
                Migrate from {market.marketTitle} V2 to {market.marketTitle} V3
              </Trans>
            }
          />
        </Box>
      }
    />
  );
};
