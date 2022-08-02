import LinearProgress, {
  linearProgressClasses,
  LinearProgressProps,
} from '@mui/material/LinearProgress';
import { Box, Typography } from '@mui/material';
import { FormattedNumber } from '../primitives/FormattedNumber';
import type { Theme } from '@mui/material';
import { DebtCeilingTooltip } from 'src/components/infoTooltips/DebtCeilingTooltip';
import { Trans } from '@lingui/macro';
import { AssetCapData } from 'src/hooks/getAssetCapUsage';

type DebtCeilingTooltipProps = {
  debt: string;
  ceiling: string;
  debtCeiling: AssetCapData;
};

export const DebtCeilingStatus = ({
  debt,
  ceiling,
  debtCeiling,
}: LinearProgressProps & DebtCeilingTooltipProps) => {
  // Protect when dividing by zero
  if (debtCeiling.percentUsed === Infinity) return null;

  const determineColor = (theme: Theme): string => {
    if (debtCeiling.isMaxed || debtCeiling.percentUsed >= 99.99) {
      return theme.palette.error.main;
    } else if (debtCeiling.percentUsed >= 98) {
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
          <DebtCeilingTooltip debtCeiling={debtCeiling} />
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
        // We show at minimum, 1% color to represent small values
        value={debtCeiling.percentUsed <= 1 ? 1 : debtCeiling.percentUsed}
      />
    </>
  );
};
