import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, styled, Typography } from '@mui/material';
import PercentIcon from 'public/icons/markets/percent-icon.svg';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

const FieldSet = styled('fieldset')(({ theme }) => ({
  height: '103px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  margin: 0,
}));

const Legend = styled('legend')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginLeft: `${theme.spacing(5)}`,
  color: theme.palette.text.secondary,
  borderRadius: '4px',
  cursor: 'default',
  ...theme.typography.subheader2,
}));

interface GhoMarketAssetsListItemProps {
  reserve?: ComputedReserveData;
}

export const GhoMarketAssetsListItem = ({ reserve }: GhoMarketAssetsListItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  const {
    ghoLoadingData,
    ghoLoadingMarketData,
    ghoComputed: { borrowAPYWithMaxDiscount },
    ghoDisplay: { facilitatorBucketLevel },
  } = useRootStore();

  return (
    <Box sx={{ px: 6, mt: 1, mb: 6 }}>
      <FieldSet>
        <Legend>
          <Trans>Aave Protocol native asset</Trans>
        </Legend>
        {!reserve || ghoLoadingData || ghoLoadingMarketData ? (
          <GhoSkeleton />
        ) : (
          <ListItem sx={{ marginTop: -2, p: 0 }}>
            <ListColumn isRow maxWidth={190}>
              <Link
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
                noWrap
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon sx={{ fontSize: '40px' }} symbol="GHO" fontSize="inherit" />
                <Box sx={{ px: 3 }}>
                  <Typography variant="h3">GHO</Typography>
                </Box>
              </Link>
            </ListColumn>
            <ListColumn>
              <FormattedNumber compact symbol="usd" value="1" visibleDecimals={2} variant="h3" />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Price</Trans>
              </Typography>
            </ListColumn>
            <ListColumn>
              <FormattedNumber
                compact
                symbol="usd"
                value={facilitatorBucketLevel}
                visibleDecimals={2}
                variant="h3"
              />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Total borrowed</Trans>
              </Typography>
            </ListColumn>
            <ListColumn>
              <FormattedNumber
                compact
                percent
                value={reserve.variableBorrowAPR}
                visibleDecimals={2}
                variant="h3"
              />
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Borrow APY</Trans>
              </Typography>
            </ListColumn>
            <ListColumn minWidth={195}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ mr: 2, position: 'relative', color: 'text.muted' }}>
                  <FormattedNumber
                    compact
                    percent
                    value={reserve.variableBorrowAPR}
                    visibleDecimals={2}
                    variant="h3"
                    symbolsColor="text.muted"
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      top: '48%',
                      borderBottom: '1px solid',
                    }}
                  />
                </Box>
                <FormattedNumber
                  compact
                  percent
                  value={borrowAPYWithMaxDiscount}
                  visibleDecimals={2}
                  variant="h3"
                  sx={{ mr: 0.5 }}
                />
                <PercentIcon />
              </Box>
              <Typography variant="secondary12" color="text.secondary">
                <Trans>Borrow APY with max discount</Trans>
              </Typography>
            </ListColumn>
            <ListColumn maxWidth={95} /> {/* empty column for spacing */}
            <ListColumn minWidth={95} align="right">
              <Button
                variant="outlined"
                component={Link}
                href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
              >
                <Trans>Details</Trans>
              </Button>
            </ListColumn>
          </ListItem>
        )}
      </FieldSet>
    </Box>
  );
};

const GhoSkeleton = () => {
  return (
    <ListItem sx={{ marginTop: -2, p: 0 }}>
      <ListColumn isRow maxWidth={190}>
        <Skeleton variant="circular" sx={{ minWidth: 40, maxWidth: 40 }} height={40} />
        <Box sx={{ px: 3 }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>
      <ListColumn>
        <Skeleton width={75} height={24} />
      </ListColumn>
      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn minWidth={195}>
        <Skeleton width={70} height={24} />
      </ListColumn>
      <ListColumn /> {/* empty column for spacing */}
      <ListColumn maxWidth={95} minWidth={95} align="right">
        <Skeleton width={74} height={38} />
      </ListColumn>
    </ListItem>
  );
};
