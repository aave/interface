import { Trans } from '@lingui/macro';
import { Alert, SxProps } from '@mui/material';

export const SupplyCapBlockingError = ({ symbol, sx }: { symbol: string; sx?: SxProps }) => {
  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>Supply cap reached for {symbol}. Reduce the amount or choose a different asset.</Trans>
    </Alert>
  );
};
