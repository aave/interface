import { ChevronRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ROUTES } from 'src/components/primitives/Link';
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
        height: {
          xs: 132,
          xsm: 124,
        },
        display: 'flex',
      }}
    >
      <Box
        sx={{
          width: '100%',
          marginTop: 'auto',
          p: 4,
          borderRadius: {
            xs: 0,
            xsm: 4,
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: {
            xs: 'flex-start',
            xsm: 'center',
          },
          height: {
            xs: 120,
            xsm: 104,
          },
          backgroundColor: '#9C93B338',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src="/illustration_token.png"
          sx={{
            position: 'absolute',
            left: -40,
            top: -33,
            width: 250,
            height: 250,
            overflow: 'hidden',
            display: {
              xs: 'none',
              xsm: 'block',
            },
            transform: 'matrix(1, -0.14, 0.14, 1, 0, 0)',
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
            <Trans>{downToXsm ? 'View details' : 'VIEW DETAILS'}</Trans>
            <ChevronRightIcon width={downToXsm ? 20 : 12} height={downToXsm ? 20 : 12} />
          </Button>
        </Box>
        <Box
          component="img"
          src="/illustration_aave_friendly_ghost.png"
          sx={{
            position: 'absolute',
            right: [-200, -190],
            bottom: [-265, -270],
            overflow: 'hidden',
            transform: 'scaleY(0.5) scaleX(0.5)',
          }}
          alt="gho ghost"
        />
      </Box>
    </Box>
  );
};
