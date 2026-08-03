import { Trans } from '@lingui/macro';
import { Alert, SxProps, Typography } from '@mui/material';

export const InsufficientLiquidityBlockingError = ({
  symbol,
  sx,
}: {
  symbol: string;
  sx?: SxProps;
}) => {
  return (
    <Alert severity="error" sx={{ mb: 6, width: '100%', mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          There is not enough liquidity in {symbol} to complete this swap. Try lowering the amount.
        </Trans>
      </Typography>
    </Alert>
  );
};
