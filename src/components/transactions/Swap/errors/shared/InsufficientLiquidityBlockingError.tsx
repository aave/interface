import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const InsufficientLiquidityBlockingError = ({
  symbol,
  sx,
}: {
  symbol: string;
  sx?: SxProps;
}) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          There is not enough liquidity in {symbol} to complete this swap. Try lowering the amount.
        </Trans>
      </Typography>
    </Warning>
  );
};


