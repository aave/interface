import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Paper, SvgIcon, Typography } from '@mui/material';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { PanelItem, PanelRow, PanelTitle } from '../ReservePanels';
import { GhoDiscountCalculator } from './GhoDiscountCalculator';

type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const GhoReserveConfiguration: React.FC<GhoReserveConfigurationProps> = ({ reserve }) => {
  const {
    ghoComputed: { percentageOfGhoMinted },
    ghoDisplay: { facilitatorBucketLevel, facilitatorBucketCapacity, maxAvailableFromFacilitator },
  } = useRootStore();

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
              href="https://governance.aave.com/uploads/short-url/6B2t8gC8Sf4WOafAcgOrdCg0Nka.pdf"
              sx={{ p: '2px 4px', mt: 2, mr: 2, minWidth: 0 }}
            >
              <Typography sx={{ mr: 1, fontSize: '10px' }}>
                <Trans>Whitepaper</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://gho.money"
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
              href="https://governance.aave.com/t/introducing-gho/8730"
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
      <Divider sx={{ my: '40px' }} />
      <PanelRow>
        <PanelTitle>
          <Trans>Borrow info</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <CapsCircularStatus
              value={percentageOfGhoMinted}
              tooltipContent={
                <>
                  <Trans>
                    Maximum amount available to borrow is{' '}
                    <FormattedNumber value={maxAvailableFromFacilitator} variant="secondary12" />{' '}
                    {reserve.symbol} (
                    <FormattedNumber
                      value={maxAvailableFromFacilitator}
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
                </Box>
              }
            >
              <Box>
                <FormattedNumber value={facilitatorBucketLevel} variant="main16" compact />
                <Typography
                  component="span"
                  color="text.primary"
                  variant="secondary16"
                  sx={{ display: 'inline-block', mx: 1 }}
                >
                  <Trans>of</Trans>
                </Typography>
                <FormattedNumber value={facilitatorBucketCapacity} variant="main16" />
              </Box>
              <Box>
                <ReserveSubheader value={facilitatorBucketLevel} />
                <Typography
                  component="span"
                  color="text.secondary"
                  variant="secondary12"
                  sx={{ display: 'inline-block', mx: 1 }}
                >
                  <Trans>of</Trans>
                </Typography>
                <ReserveSubheader value={facilitatorBucketCapacity} />
              </Box>
            </PanelItem>
            <PanelItem title={<Trans>APY</Trans>}>
              <FormattedNumber value={reserve.variableBorrowAPR} percent variant="main16" />
            </PanelItem>
          </Box>
        </Box>
      </PanelRow>
      <Divider sx={{ my: '40px' }} />
      <PanelRow id="discount">
        <PanelTitle>
          <Trans>Discount info</Trans>
        </PanelTitle>
        <Box sx={{ width: '100%' }}>
          <GhoDiscountCalculator />
        </Box>
      </PanelRow>
    </Paper>
  );
};
