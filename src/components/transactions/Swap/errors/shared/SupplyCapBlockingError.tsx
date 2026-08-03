import { Trans } from '@lingui/macro';
import { Alert, SxProps, Typography } from '@mui/material';

export const SupplyCapBlockingError = ({ symbol, sx }: { symbol: string; sx?: SxProps }) => {
  return (
    <Alert severity="error" sx={{ mb: 6, width: '100%', mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          Supply cap reached for {symbol}. Reduce the amount or choose a different asset.
        </Trans>
      </Typography>
    </Alert>
  );
};
