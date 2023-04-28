import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Paper, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ReserveEModePanel } from '../ReserveEModePanel';
import { PanelRow, PanelTitle } from '../ReservePanels';
import { GhoBorrowInfo } from './GhoBorrowInfo';
import { GhoDiscountCalculator } from './GhoDiscountCalculator';

type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const GhoReserveConfiguration: React.FC<GhoReserveConfigurationProps> = ({ reserve }) => {
  return (
    <Paper sx={{ py: '16px', px: '16px' }}>
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

      <PanelRow>
        <PanelTitle>
          <Trans>About GHO</Trans>
        </PanelTitle>
        <Box>
          <Typography gutterBottom>
            <Trans>
              GHO is a native decentralized, collateral-backed digital asset pegged to USD. It is
              created by users via borrowing against multiple collateral. When user repays their GHO
              borrow position, the protocol burns that user&apos;s GHO. All the interest payments
              accrued by minters of GHO would be directly transferred to the AaveDAO treasury.
            </Trans>
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://github.com/aave/gho/blob/main/techpaper/GHO_Technical_Paper.pdf"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Techpaper</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://gho.xyz"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Website</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://docs.gho.xyz/concepts/faq"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>FAQ</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
          </Box>
        </Box>
      </PanelRow>
      <Divider sx={{ my: { xs: 6, sm: 10 } }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Borrow info</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%', mt: 8 }}>
          <GhoBorrowInfo reserve={reserve} />
          <Box sx={{ mt: 8 }}>
            <GhoDiscountCalculator />
          </Box>
        </Box>
      </PanelRow>
      {reserve.eModeCategoryId !== 0 && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <Box sx={{ mb: 8 }}>
            <ReserveEModePanel reserve={reserve} />
          </Box>
        </>
      )}
    </Paper>
  );
};
