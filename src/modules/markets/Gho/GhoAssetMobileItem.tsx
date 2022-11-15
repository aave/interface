import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

interface GhoAssetMobileItemProps {
  reserve: ComputedReserveData;
}

export const GhoAssetMobileItem = ({ reserve }: GhoAssetMobileItemProps) => {
  const { currentMarket } = useProtocolDataContext();
  const theme = useTheme();

  const {
    ghoDiscountRatePercent,
    ghoFacilitatorBucketLevel,
    ghoComputed: { borrowAPRWithMaxDiscount },
  } = useRootStore();

  return (
    <Box>
      <Divider />
      <Box sx={{ px: 4, pt: 4, pb: 6 }}>
        <Box
          sx={{
            display: 'inline-flex',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 1,
          }}
        >
          <Trans>Aave Protocol native asset</Trans>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
          <TokenIcon sx={{ fontSize: '40px' }} symbol="GHO" fontSize="inherit" />
          <Box sx={{ px: 3 }}>
            <Typography variant="h3">GHO</Typography>
          </Box>
        </Box>
        <Row sx={{ mb: 3 }} caption={<Trans>Price</Trans>} captionVariant="description">
          <FormattedNumber
            compact
            symbol="usd"
            value="1"
            visibleDecimals={2}
            variant="secondary14"
          />
        </Row>
        <Row sx={{ mb: 3 }} caption={<Trans>Total borrowed</Trans>} captionVariant="description">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-end' },
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <FormattedNumber
              compact
              value={ghoFacilitatorBucketLevel}
              visibleDecimals={2}
              variant="secondary14"
            />
            <ReserveSubheader value={ghoFacilitatorBucketLevel} rightAlign={true} />
          </Box>
        </Row>
        <Row sx={{ mb: 3 }} caption={<Trans>Borrow APY</Trans>} captionVariant="description">
          <FormattedNumber
            compact
            percent
            value={reserve.variableBorrowAPR}
            variant="secondary14"
          />
        </Row>
        <Row
          sx={{ mb: 4 }}
          caption={<Trans>Borrow APY with max discount</Trans>}
          captionVariant="description"
        >
          <Box>
            <FormattedNumber
              compact
              percent
              value={borrowAPRWithMaxDiscount}
              variant="secondary14"
            />
            <Box
              sx={{
                color: '#fff',
                borderRadius: '4px',
                height: '20px',
                display: 'flex',
                my: 0.5,
                p: 1,
                background: (theme) => theme.palette.gradients.aaveGradient,
              }}
            >
              <FormattedNumber
                compact
                percent
                value={ghoDiscountRatePercent * -1}
                visibleDecimals={0}
                variant="main12"
                symbolsColor="white"
              />
            </Box>
          </Box>
        </Row>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
          fullWidth
        >
          <Trans>View details</Trans>
        </Button>
      </Box>
    </Box>
  );
};
