import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';

export const GhoDiscountProgram = () => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const currentMarket = useRootStore((store) => store.currentMarket);
  const ghoMarketConfig = useRootStore((store) => store.ghoMarketConfig);

  return (
    <Box
      sx={{
        overflow: 'hidden',
        height: [132, 124],
        display: 'flex',
      }}
    >
      <Box
        sx={{
          width: '100%',
          marginTop: 'auto',
          p: 4,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: ['flex-start', 'center'],
          height: [120, 104],
          backgroundColor: '#9C93B338',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src="/illustration_token.svg"
          sx={{
            position: 'absolute',
            left: -20,
            bottom: -45,
            overflow: 'hidden',
            display: ['none', 'block'],
          }}
          width={220}
          height={220}
          alt="gho coin"
        />
        <Box display="flex" flexDirection="column" alignItems={['flex-start', 'center']} gap={3}>
          <Typography
            variant="subheader1"
            color="text.primary"
            width={['221px', '300px']}
            textAlign={['left', 'center']}
          >
            {downToXsm ? (
              <Trans>stkAAVE holders get a discount on GHO borrow rate</Trans>
            ) : (
              <Trans>Holders of stkAAVE receive a discount on the GHO borrowing rate</Trans>
            )}
          </Typography>
          <Button
            variant="contained"
            href={ROUTES.reserveOverview(ghoMarketConfig().ghoTokenAddress, currentMarket)}
            size={downToXsm ? 'medium' : 'small'}
            sx={{
              alignItems: 'center',
              display: 'flex',
              gap: [2, 1],
            }}
          >
            {downToXsm && <TokenIcon sx={{ fontSize: '21px' }} symbol="GHO" fontSize="inherit" />}
            {<Trans>{downToXsm ? 'View details' : 'VIEW DETAILS'}</Trans>}
            {downToXsm ? (
              <ArrowRightIcon width={20} height={20} />
            ) : (
              <ChevronRightIcon width={12} height={12} />
            )}
          </Button>
        </Box>
        <Box
          component="img"
          src="/illustration_aave_friendly_ghost.svg"
          sx={{
            position: 'absolute',
            right: -20,
            bottom: [-38, -45],
            overflow: 'hidden',
          }}
          width={220}
          height={220}
          alt="gho ghost"
        />
      </Box>
    </Box>
  );
};
