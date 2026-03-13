import { ShieldExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { Dispatch, useEffect, useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';

import { ActionsBlockedReason, OrderType, SwapState } from '../../types';
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
    // Skip when amounts aren't populated yet
    if (!sell || !buy) return 0;
    return valueLostPercentage(buy, sell);
  }, [state.buyAmountUSD, state.sellAmountUSD, state.swapRate]);

  // Limit orders are off-chain intents that only execute at the user's price,
  // so price impact doesn't apply the same way as market orders.
  const isLimitOrder = 'orderType' in state && state.orderType === OrderType.LIMIT;
  const shouldBlock = shieldEnabled && !isLimitOrder && lostValue > SHIELD_PRICE_IMPACT_THRESHOLD;

  useEffect(() => {
    setState({
      actionsBlocked: {
        [ActionsBlockedReason.SHIELD_BLOCKED]: shouldBlock || undefined,
      },
    });
  }, [shouldBlock, state.quoteLastUpdatedAt]);

  if (!shouldBlock) return null;

  return (
    <Warning
      severity="error"
      icon={false}
      sx={{
        mt: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <SvgIcon sx={{ fontSize: 20 }}>
          <ShieldExclamationIcon />
        </SvgIcon>
        <Typography variant="subheader1">
          <Trans>Aave Shield: Transaction blocked</Trans>
        </Typography>
      </Box>
      <Typography variant="caption">
        <Trans>
          This swap has a price impact of {(lostValue * 100).toFixed(1)}%, which exceeds the 25%
          safety threshold. To proceed, disable Aave Shield in the settings menu.
        </Trans>
      </Typography>
    </Warning>
  );
}
