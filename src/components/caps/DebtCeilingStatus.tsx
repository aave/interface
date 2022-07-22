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
  usage: number;
};

export const DebtCeilingStatus = ({
  debt,
  ceiling,
  usage,
}: LinearProgressProps & DebtCeilingTooltipProps) => {
  // Protect when dividing by zero
  if (usage === Infinity) return null;

  const determineColor = (theme: Theme): string => {
    if (usage >= 99.95) {
      return theme.palette.error.main;
    } else if (usage >= 80) {
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
            value={debt}
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
            value={ceiling}
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
          my: 2,
          height: 5,
          [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: (theme) =>
              theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
          },
          [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5,
            backgroundColor: (theme) => determineColor(theme),
          },
        }}
        // We show at minium, 1% color to represent small values
        value={usage <= 1 ? 1 : usage}
      />
    </>
  );
};
