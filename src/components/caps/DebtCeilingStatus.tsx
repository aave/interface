import LinearProgress, {
  linearProgressClasses,
  LinearProgressProps,
} from '@mui/material/LinearProgress';
import { Box, Typography } from '@mui/material';
import { FormattedNumber } from '../primitives/FormattedNumber';
import type { Theme } from '@mui/material';
import { DebtCeilingTooltip } from 'src/components/infoTooltips/DebtCeilingTooltip';
import { Trans } from '@lingui/macro';

type DebtCeilingTooltipProps = {
  debt: string;
  ceiling: string;
};

export const DebtCeilingStatus = (props: LinearProgressProps & DebtCeilingTooltipProps) => {
  const percentage = (parseInt(props.debt) / parseInt(props.ceiling)) * 100;

  // Protect when dividing by zero
  if (percentage === Infinity) return null;

  const determineColor = (theme: Theme): string => {
    if (percentage >= 100) {
      return theme.palette.error.main;
    } else if (percentage >= 80) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.success.main;
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <Typography color="text.secondary" component="span">
            <Trans>Debt Ceiling</Trans>
          </Typography>
          <DebtCeilingTooltip />
        </Box>
        <Box>
          <FormattedNumber
            value={props.debt}
            variant="main14"
            symbol="USD"
            symbolsVariant="secondary14"
            visibleDecimals={2}
          />
          <Typography
            component="span"
            color="text.secondary"
            variant="secondary14"
            sx={{ display: 'inline-block', mx: 1 }}
          >
            <Trans>of</Trans>
          </Typography>
          <FormattedNumber
            value={props.ceiling}
            variant="main14"
            symbol="USD"
            symbolsVariant="secondary14"
            visibleDecimals={2}
          />
        </Box>
      </Box>

      <LinearProgress
        variant="determinate"
        sx={{
          borderRadius: 5,
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: (theme) =>
              theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
          },
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
            backgroundColor: (theme) => determineColor(theme),
          },
        }}
        {...props}
        value={percentage <= 1 ? 1 : percentage}
      />
    </>
  );
};
