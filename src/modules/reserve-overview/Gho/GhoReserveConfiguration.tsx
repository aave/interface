import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Paper, SvgIcon, Typography } from '@mui/material';
import { Link } from 'src/components/primitives/Link';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import { PanelRow, PanelTitle } from '../ReservePanels';
import { GhoDiscountCalculator } from './GhoDiscountCalculator';

type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const GhoReserveConfiguration: React.FC<GhoReserveConfigurationProps> = ({ reserve }) => {
  return (
    <Paper sx={{ py: '16px', px: '24px' }}>
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
              GHO is a native decentralized, collateral-backed stablecoin pegged to USD. It is
              created by users via borrowing against multiple collateral. When user repays their GHO
              borrow position, the protocol burns that user’s GHO. All the interest payments accrued
              by minters of GHO would be directly transferred to the AaveDAO treasury. Also, Safety
              Module participants (stkAAVE holders) can access a discount on the GHO borrow interest
              rate.
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
              href=""
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Whitepaper</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Link href="#">
              <Button
                component={Link}
                variant="outlined"
                size="small"
                href=""
                sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
              >
                <Typography sx={{ mr: 1, fontSize: '10px' }}>
                  <Trans>Website</Trans>
                </Typography>
                <SvgIcon sx={{ fontSize: 14 }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Button>
            </Link>
            <Link href="#">
              <Button
                component={Link}
                variant="outlined"
                size="small"
                href=""
                sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
              >
                <Typography sx={{ mr: 1, fontSize: '10px' }}>
                  <Trans>FAQ</Trans>
                </Typography>
                <SvgIcon sx={{ fontSize: 14 }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Button>
            </Link>
          </Box>
        </Box>
      </PanelRow>
      <Divider sx={{ my: '40px' }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Borrow info</Trans>
        </PanelTitle>
      </PanelRow>
      <Divider sx={{ my: '40px' }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Discount program</Trans>
        </PanelTitle>
        <Box sx={{ width: '100%' }}>
          <GhoDiscountCalculator baseVariableBorrowRate={reserve.baseVariableBorrowRate} />
        </Box>
      </PanelRow>
      <Divider sx={{ my: '40px' }} />
      <PanelRow>
        <PanelTitle>
          <Trans>E-Mode info</Trans>
        </PanelTitle>
      </PanelRow>
    </Paper>
  );
};
