import { Trans } from '@lingui/macro';
import { Box, Button, styled, Typography } from '@mui/material';
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

interface GhoAssetItemProps {
  reserve: ComputedReserveData;
}

export const GhoAssetItem = ({ reserve }: GhoAssetItemProps) => {
  const { currentMarket } = useProtocolDataContext();

  const getBorrowAPR = useRootStore((state) => state.ghoComputed.borrowAPRWithMaxDiscount);
  const totalBorrowed = useRootStore((state) => state.ghoFacilitatorBucketLevel);
  const ghoDiscountRate = useRootStore((state) => state.ghoDiscountRatePercent);

  return (
    <Box sx={{ px: 6, mt: 1, mb: 6 }}>
      <FieldSet>
        <Legend>
          <Trans>Aave Protocol native asset</Trans>
        </Legend>
        <ListItem sx={{ marginTop: -2, p: 0 }}>
          <ListColumn isRow maxWidth={190}>
            <TokenIcon sx={{ fontSize: '40px' }} symbol="GHO" fontSize="inherit" />
            <Box sx={{ px: 3 }}>
              <Typography variant="h3">GHO</Typography>
            </Box>
          </ListColumn>
          <ListColumn>
            <FormattedNumber compact symbol="usd" value="1" visibleDecimals={2} variant="h3" />
            <Typography variant="secondary12" color="text.secondary">
              Price
            </Typography>
          </ListColumn>
          <ListColumn>
            <FormattedNumber
              compact
              symbol="usd"
              value={totalBorrowed.toString()}
              visibleDecimals={2}
              variant="h3"
            />
            <Typography variant="secondary12" color="text.secondary">
              Total borrowed
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
              Borrow APY
            </Typography>
          </ListColumn>
          <ListColumn minWidth={195}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormattedNumber
                compact
                percent
                value={getBorrowAPR()}
                visibleDecimals={1}
                variant="h3"
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
                  value={ghoDiscountRate * -1}
                  visibleDecimals={0}
                  variant="main12"
                  symbolsColor="white"
                />
              </Box>
            </Box>
            <Typography variant="secondary12" color="text.secondary">
              Borrow APY with max discount
            </Typography>
          </ListColumn>
          <ListColumn /> {/* empty column for spacing */}
          <ListColumn maxWidth={95} minWidth={95} align="right">
            <Button
              variant="outlined"
              component={Link}
              href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
            >
              <Trans>Details</Trans>
            </Button>
          </ListColumn>
        </ListItem>
      </FieldSet>
    </Box>
  );
};
