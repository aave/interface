import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

export const InsufficientLiquidityBlockingError = ({
  symbol,
  sx,
}: {
  symbol: string;
  sx?: SxProps;
}) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>
        There is not enough liquidity in {symbol} to complete this swap. Try lowering the amount.
      </Trans>
    </Alert>
  );
};
