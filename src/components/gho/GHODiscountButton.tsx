import { ArrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Divider,
  Paper,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { formatUnits } from 'ethers/lib/utils';
import { useRootStore } from 'src/store/root';

import { FormattedNumber } from '../primitives/FormattedNumber';
import { Link } from '../primitives/Link';
import { TokenIcon } from '../primitives/TokenIcon';

export const GHODiscountButton = ({ baseRate }: { baseRate: string | number }) => {
  const theme = useTheme();
  const [stakeUserResult, ghoDiscountedPerToken, ghoDiscountRatePercent] = useRootStore((state) => [
    state.stakeUserResult,
    state.ghoDiscountedPerToken,
    state.ghoDiscountRatePercent,
  ]);
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const discountPaper = {
    mr: 2,
    p: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: downToXSM ? 'center' : 'left',
    boxShadow: 'none',
    bgcolor: 'background.surface',
    height: '24px',
    width: downToXSM ? '100%' : 'auto',
  };

  const normalizedBaseRate = Number(baseRate) / 10 ** 27;
  const discountRate = normalizedBaseRate - normalizedBaseRate * ghoDiscountRatePercent;

  const stkAaveBalance = stakeUserResult ? stakeUserResult.aave.stakeTokenUserBalance : '0';

  // Amount of GHO that can be borrowed at a discounted rate given a users stkAave balance
  const discountableAmount =
    Number(formatUnits(stkAaveBalance, 18)) * Number(ghoDiscountedPerToken);

  // TO-DO: fetch timestamp from GHO store
  const lockPeriod = dayjs.unix(1683292439).format('D MMM YYYY');

  return Number(discountableAmount) > 0 ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: downToXSM ? 4 : 1,
        ml: downToXSM ? 0 : 4,
        flexDirection: downToXSM ? 'column' : 'row',
        gap: downToXSM ? 2 : 0, // space betwen rows on mobile
      }}
    >
      <Paper sx={discountPaper}>
        <Typography variant="caption" color="text.primary" sx={{ mx: 1 }}>
          Discount info
        </Typography>
        <TokenIcon symbol={'GHO'} sx={{ fontSize: `14px`, mr: 1 }} />
        <FormattedNumber value={discountableAmount} variant="main12" color="text.primary" />
        <Divider orientation="vertical" color="text.primary" sx={{ mx: 2 }} />
        <FormattedNumber value={discountRate} variant="main12" color="text.primary" percent />
        <Typography variant="caption" color="text.primary" sx={{ mx: 1 }}>
          APY
        </Typography>
      </Paper>

      <Paper sx={discountPaper}>
        <Typography variant="caption" color="text.primary" sx={{ mx: 1 }}>
          <Trans>Lock period</Trans>
        </Typography>
        <Typography variant="main12" color="text.primary" sx={{ mx: 1 }}>
          {lockPeriod}
        </Typography>
      </Paper>
    </Box>
  ) : (
    <Button
      endIcon={
        <SvgIcon sx={{ width: 14, height: 14 }}>
          <ArrowRightIcon />
        </SvgIcon>
      }
      component={Link}
      size="small"
      variant="outlined"
      href="https://docs.aave.com" // TO-DO: Link to GHO docs
      sx={{ width: downToXSM ? '100%' : '275px', mt: downToXSM ? 4 : 0, ml: downToXSM ? 0 : 4 }}
    >
      <Typography variant="buttonS">
        <Trans>Discount is available. Learn more</Trans>
      </Typography>
    </Button>
  );
};
