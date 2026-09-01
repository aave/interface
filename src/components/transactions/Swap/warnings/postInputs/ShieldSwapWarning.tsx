import { Trans } from '@lingui/macro';
import { Alert, AlertTitle } from '@mui/material';
import { Dispatch, useEffect, useMemo } from 'react';
import { useRootStore } from 'src/store/root';

import { ActionsBlockedReason, SwapState } from '../../types';
import { valueLostPercentage } from '../helpers';

const SHIELD_PRICE_IMPACT_THRESHOLD = 0.25;

export function ShieldSwapWarning({
  state,
  setState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  const shieldEnabled = useRootStore((store) => store.shieldEnabled);

  const lostValue = useMemo(() => {
    if (!state.swapRate) return 0;
    const sell = Number(state.sellAmountUSD);
    const buy = Number(state.buyAmountUSD);
    // Skip when sell amount isn't populated yet (no quote).
    // Zero buy with nonzero sell is a real outcome (total value loss) - don't skip it.
    if (!sell) return 0;
    return valueLostPercentage(buy, sell);
  }, [state.buyAmountUSD, state.sellAmountUSD, state.swapRate]);

  const shouldBlock = shieldEnabled && lostValue > SHIELD_PRICE_IMPACT_THRESHOLD;

  useEffect(() => {
    setState({
      actionsBlocked: {
        [ActionsBlockedReason.SHIELD_BLOCKED]: shouldBlock || undefined,
      },
    });
  }, [shouldBlock, state.quoteLastUpdatedAt]);

  if (!shouldBlock) return null;

  return (
    <Alert severity="error" data-size="small" sx={{ width: '100%', mt: 2, mb: 2 }}>
      <AlertTitle>
        <Trans>Aave Shield: Transaction blocked</Trans>
      </AlertTitle>
      <Trans>
        This swap has a price impact of {(lostValue * 100).toFixed(1)}%, which exceeds the 25%
        safety threshold. To proceed, disable Aave Shield in the settings menu.
      </Trans>
    </Alert>
  );
}
