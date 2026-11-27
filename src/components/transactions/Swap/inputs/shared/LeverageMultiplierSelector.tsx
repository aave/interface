import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Skeleton, Slider, Typography } from '@mui/material';
import { Dispatch, useEffect } from 'react';

import { isBackendRates, SwapState } from '../../types';

const PRESET_MULTIPLIERS = [1.5, 2, 3];
// The quote's maxSafeMultiplier is the liquidation edge; the selector stops short of it.
const SAFETY_BUFFER = 0.9;
const DEBOUNCE_MS = 400;

// Two decimals, so the next stop up clears the unrounded value the backend checks against.
const usableMin = (minMultiplier: number) => Math.round(minMultiplier * 100) / 100;
const usableMax = (maxSafeMultiplier: number) =>
  Math.floor(maxSafeMultiplier * SAFETY_BUFFER * 100) / 100;

const formatMultiplier = (value: number) => `${value.toFixed(2)}x`;

/**
 * Picks the target multiplier of the whole position. The range comes from the latest leverage
 * quote and is kept through a failed one; at or below the current multiplier nothing is chosen.
 */
export const LeverageMultiplierSelector = ({
  state,
  setState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const quoted = isBackendRates(state.swapRate) ? state.swapRate.leverage : undefined;
  const range = state.leverageRange;
  const chosen = state.leverageMultiplier;

  useEffect(() => {
    if (!quoted) return;
    const min = usableMin(quoted.minMultiplier);
    const max = usableMax(quoted.maxSafeMultiplier);
    if (range?.min !== min || range?.max !== max) setState({ leverageRange: { min, max } });
  }, [quoted]);

  // Another debt asset has another range.
  useEffect(() => {
    setState({
      leverageRange: undefined,
      leverageMultiplier: undefined,
      debouncedLeverageMultiplier: undefined,
    });
  }, [state.destinationToken.underlyingAddress]);

  useEffect(() => {
    if (!range || chosen === undefined) return;
    const clamped = Math.min(chosen, range.max);
    const next = clamped > range.min ? clamped : undefined;
    if (next !== chosen) setState({ leverageMultiplier: next });
  }, [range]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setState({ debouncedLeverageMultiplier: chosen }),
      DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [chosen]);

  const choose = (value: number) => {
    if (!range) return;
    setState({
      leverageMultiplier: value > range.min ? Math.min(value, range.max) : undefined,
      quoteRefreshPaused: false,
    });
  };

  if (!range) {
    return state.ratesLoading ? (
      <Skeleton variant="rectangular" height={72} sx={{ borderRadius: '4px', mb: 4 }} />
    ) : null;
  }

  const cannotLeverage = range.max <= Math.max(1, range.min);
  const presets = PRESET_MULTIPLIERS.filter((preset) => preset > range.min && preset < range.max);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" color="fg-2">
          <Trans>Target leverage</Trans>
        </Typography>
        <Typography variant="h5" color="fg-1" data-cy="leverageMultiplierValue">
          {formatMultiplier(range.min)}
          {' → '}
          {chosen !== undefined ? formatMultiplier(chosen) : '-'}
        </Typography>
      </Box>

      {cannotLeverage ? (
        <Alert severity="info" data-size="small" sx={{ mt: 2 }}>
          <Trans>This position cannot be leveraged further with this debt asset.</Trans>
        </Alert>
      ) : (
        <>
          <Box sx={{ px: 2 }}>
            <Slider
              value={chosen ?? range.min}
              min={range.min}
              max={range.max}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={formatMultiplier}
              onChange={(_, value) => choose(value as number)}
              disabled={state.actionsLoading || state.mainTxState.loading}
              data-cy="leverageMultiplierSlider"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {[...presets, range.max].map((preset, index) => (
              <Button
                key={preset}
                size="small"
                fullWidth
                variant={chosen === preset ? 'contained' : 'outlined'}
                onClick={() => choose(preset)}
                disabled={state.actionsLoading || state.mainTxState.loading}
                data-cy={`leverageMultiplier_${index === presets.length ? 'max' : preset}`}
              >
                {index === presets.length ? <Trans>Max</Trans> : formatMultiplier(preset)}
              </Button>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};
