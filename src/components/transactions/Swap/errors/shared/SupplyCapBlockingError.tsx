import { Trans } from '@lingui/macro';
import { SxProps, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

export const SupplyCapBlockingError = ({ symbol, sx }: { symbol: string; sx?: SxProps }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption">
        <Trans>
          Supply cap reached for {symbol}. Reduce the amount or choose a different asset.
        </Trans>
      </Typography>
    </Warning>
  );
};
