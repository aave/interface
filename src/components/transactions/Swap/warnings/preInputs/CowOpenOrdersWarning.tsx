import { Link, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { findByChainId } from 'src/ui-config/marketsConfig';

import { SwapState } from '../../types';

export function CowOpenOrdersWarning({
  state,
  cowOpenOrdersTotalAmountFormatted,
}: {
  state: SwapState;
  cowOpenOrdersTotalAmountFormatted?: string;
}) {
  if (!cowOpenOrdersTotalAmountFormatted) return null;

  return (
    <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
      <Typography variant="caption">
        You have open orders for {cowOpenOrdersTotalAmountFormatted} {state.sourceToken.symbol}.{' '}
        <br /> Track them in your{' '}
        <Link target="_blank" href={`/history?marketName=${findByChainId(state.chainId)?.market}`}>
          transaction history
        </Link>
      </Typography>
    </Warning>
  );
}
