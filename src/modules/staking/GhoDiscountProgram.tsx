import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import GhoBorrowApyRange from 'src/components/GhoBorrowApyRange';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useRootStore } from 'src/store/root';

const FieldSet = styled('fieldset')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  margin: 0,
}));

export const GhoDiscountProgram = () => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const { currentMarket, ghoMarketConfig } = useRootStore();

  const styles = {
    desktop: {
      pt: 4,
    },
    mobile: {
      pt: 4,
      position: 'relative',
      '&:before': {
        content: "''",
        position: 'absolute',
        top: 0,
        left: '-16px',
        width: 'calc(100% + 32px)',
        height: '1px',
        bgcolor: { xs: 'divider', xsm: 'transparent' },
      },
    },
  };

  return (
    <Box sx={downToXsm ? styles.mobile : styles.desktop}>
      <Box display="flex" justifyContent={downToXsm ? 'center' : 'flex-start'}>
        <TextWithTooltip
          text={<Trans>Stake AAVE and borrow GHO at a lower rate</Trans>}
          variant="subheader1"
        >
          <>
            <Trans>
              For each staked AAVE Safety Module participants may borrow GHO with lower interest
              rate.
            </Trans>{' '}
            <Link
              href={
                ROUTES.reserveOverview(ghoMarketConfig().ghoTokenAddress, currentMarket) +
                '/#discount'
              }
              underline="always"
            >
              <Trans>Learn more</Trans>
            </Link>
          </>
        </TextWithTooltip>
      </Box>
      <FieldSet sx={{ mt: 2, px: 4, py: downToXsm ? 4 : 3 }}>
        {downToXsm ? <GhoDiscountProgramMobile /> : <GhoDiscountProgramDesktop />}
      </FieldSet>
    </Box>
  );
};

const GhoDiscountProgramDesktop: React.FC = () => {
  const { currentMarket, ghoMarketConfig, ghoReserveDataFetched } = useRootStore();

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
            <Trans>Price</Trans>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!ghoReserveDataFetched ? (
              <Skeleton width={70} height={24} />
            ) : (
              <FormattedNumber symbol="USD" value={1} visibleDecimals={2} variant="main14" />
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
            {!ghoReserveDataFetched ? (
              <Skeleton width={80} height={20} />
            ) : (
              <GhoBorrowApyRange percentVariant="main14" hyphenVariant="secondary14" />
            )}
          </Box>
        </Box>
      </ListColumn>
      <ListColumn align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(ghoMarketConfig().ghoTokenAddress, currentMarket)}
        >
          <Trans>Details</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};

const GhoDiscountProgramMobile: React.FC = () => {
  const { currentMarket, ghoMarketConfig, ghoReserveDataFetched } = useRootStore();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TokenIcon sx={{ fontSize: '32px' }} symbol="GHO" fontSize="inherit" />
        <Box sx={{ ml: 2 }}>
          <Typography variant="h4">GHO</Typography>
        </Box>
      </Box>
      <Row
        sx={{ mb: 5 }}
        caption={
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Price</Trans>
          </Typography>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!ghoReserveDataFetched ? (
            <Skeleton width={70} height={24} />
          ) : (
            <FormattedNumber value={1} visibleDecimals={2} variant="main14" symbol="USD" />
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
          {!ghoReserveDataFetched ? (
            <Skeleton width={60} height={40} />
          ) : (
            <GhoBorrowApyRange percentVariant="main14" hyphenVariant="secondary14" />
          )}
        </Box>
      </Row>
      <Button
        fullWidth
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(ghoMarketConfig().ghoTokenAddress, currentMarket)}
      >
        <Trans>Details</Trans>
      </Button>
    </Box>
  );
};
