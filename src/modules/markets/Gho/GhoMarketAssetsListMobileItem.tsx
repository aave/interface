import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import { GhoDiscountedBorrowAPYTag } from 'src/components/GhoDiscountedBorrowAPYTag';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

import { MarketAssetsListMobileItemLoader } from '../MarketAssetsListMobileItemLoader';

interface GhoMarketAssetsListMobileItemProps {
  reserve?: ComputedReserveData;
}

export const GhoMarketAssetsListMobileItem = ({ reserve }: GhoMarketAssetsListMobileItemProps) => {
  const { currentMarket } = useProtocolDataContext();
  const theme = useTheme();

  const {
    ghoDiscountRatePercent,
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPYWithMaxDiscount },
    ghoDisplay: { facilitatorBucketLevel },
  } = useRootStore();

  if (!reserve || ghoLoadingData || ghoLoadingMarketData) {
    return <MarketAssetsListMobileItemLoader />;
  }

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
              value={facilitatorBucketLevel}
              visibleDecimals={2}
              variant="secondary14"
            />
            <ReserveSubheader value={facilitatorBucketLevel} rightAlign={true} />
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
              value={borrowAPYWithMaxDiscount}
              variant="secondary14"
            />
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
