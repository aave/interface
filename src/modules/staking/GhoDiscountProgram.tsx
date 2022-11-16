import { Trans } from '@lingui/macro';
import { Box, Button, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import { GhoDiscountedBorrowAPYTag } from 'src/components/GhoDiscountedBorrowAPYTag';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';

const FieldSet = styled('fieldset')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  margin: 0,
}));

const Legend = styled('legend')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  margin: 'auto',
  color: theme.palette.text.secondary,
  borderRadius: '4px',
  cursor: 'default',
  ...theme.typography.main12,
}));

export const GhoDiscountProgram = () => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const {
    ghoDiscountRatePercent,
    ghoComputed: { borrowAPRWithMaxDiscount, discountableAmount },
  } = useRootStore();

  return (
    <Box sx={{ mt: 5 }}>
      <FieldSet>
        <Legend>
          <Trans>Discount program</Trans>
        </Legend>
        <Box sx={{ mx: 1 }}>
          <Warning sx={{ width: '100%', my: 2 }} severity="info">
            <Trans>
              Safety Module participants receive a discount on the GHO borrow interest rate.
            </Trans>
          </Warning>
        </Box>
        {downToXsm ? (
          <GhoDiscountProgramMobile
            discountableAmount={discountableAmount}
            aprWithDiscount={borrowAPRWithMaxDiscount}
            ghoDiscountRatePercent={ghoDiscountRatePercent}
          />
        ) : (
          <GhoDiscountProgramDesktop
            discountableAmount={discountableAmount}
            aprWithDiscount={borrowAPRWithMaxDiscount}
            ghoDiscountRatePercent={ghoDiscountRatePercent}
          />
        )}
      </FieldSet>
    </Box>
  );
};

interface GhoDiscountProgramProps {
  discountableAmount: number;
  aprWithDiscount: number;
  ghoDiscountRatePercent: number;
}

const GhoDiscountProgramDesktop = ({
  discountableAmount,
  aprWithDiscount,
  ghoDiscountRatePercent,
}: GhoDiscountProgramProps) => {
  return (
    <ListItem sx={{ px: 0, minHeight: 'unset' }}>
      <ListColumn isRow minWidth={120} maxWidth={200}>
        <TokenIcon sx={{ fontSize: '32px' }} symbol="GHO" fontSize="inherit" />
        <Box sx={{ px: 3 }}>
          <Typography variant="h4">GHO</Typography>
        </Box>
      </ListColumn>
      <ListColumn minWidth={150}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Discountable amount</Trans>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {discountableAmount > 0 ? (
              <FormattedNumber
                compact
                value={discountableAmount}
                visibleDecimals={1}
                variant="main14"
              />
            ) : (
              <>
                <TokenIcon sx={{ fontSize: '16px' }} symbol="GHO" fontSize="inherit" />
                <FormattedNumber value={100} visibleDecimals={0} variant="main14" />
                <Typography>
                  <Trans>to</Trans>
                </Typography>
                <TokenIcon sx={{ fontSize: '16px' }} symbol="AAVE" fontSize="inherit" />
                <FormattedNumber value={1} visibleDecimals={0} variant="main14" />
              </>
            )}
          </Box>
        </Box>
      </ListColumn>
      <ListColumn minWidth={150}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Borrow APY</Trans>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormattedNumber
              compact
              percent
              value={aprWithDiscount}
              visibleDecimals={1}
              variant="main14"
            />
            <GhoDiscountedBorrowAPYTag rate={ghoDiscountRatePercent} />
          </Box>
        </Box>
      </ListColumn>
      <ListColumn align="right">
        <Button variant="outlined" disabled>
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};

const GhoDiscountProgramMobile = ({
  discountableAmount,
  aprWithDiscount,
  ghoDiscountRatePercent,
}: GhoDiscountProgramProps) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', my: 4 }}>
        <TokenIcon sx={{ fontSize: '40px' }} symbol="GHO" fontSize="inherit" />
        <Box sx={{ px: 3 }}>
          <Typography variant="h4">GHO</Typography>
        </Box>
      </Box>
      <Row
        sx={{ mb: 2 }}
        caption={
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Discountable amount</Trans>
          </Typography>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {discountableAmount > 0 ? (
            <FormattedNumber
              compact
              value={discountableAmount}
              visibleDecimals={1}
              variant="main14"
            />
          ) : (
            <>
              <TokenIcon sx={{ fontSize: '16px' }} symbol="GHO" fontSize="inherit" />
              <FormattedNumber value={100} visibleDecimals={0} variant="main14" />
              <Typography>
                <Trans>to</Trans>
              </Typography>
              <TokenIcon sx={{ fontSize: '16px' }} symbol="AAVE" fontSize="inherit" />
              <FormattedNumber value={1} visibleDecimals={0} variant="main14" />
            </>
          )}
        </Box>
      </Row>
      <Row
        sx={{ mb: 4 }}
        caption={
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Borrow APY</Trans>
          </Typography>
        }
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormattedNumber
            compact
            percent
            value={aprWithDiscount}
            visibleDecimals={1}
            variant="main14"
          />
          <GhoDiscountedBorrowAPYTag rate={ghoDiscountRatePercent} />
        </Box>
      </Row>
      <Button variant="outlined" fullWidth disabled>
        <Trans>Details</Trans>
      </Button>
    </Box>
  );
};
