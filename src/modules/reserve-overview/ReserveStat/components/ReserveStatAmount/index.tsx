import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

interface ReserveStatAmountProps {
  usd: string;
  amount: string;
  symbol: string;
  cap?: { usd: string; amount: { value: string } };
}

export const ReserveStatAmount = ({ usd, amount, symbol, cap }: ReserveStatAmountProps) => (
  <>
    <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
      <FormattedNumber value={usd} symbol="USD" compact variant="h2" />
      {cap && (
        <>
          <Typography variant="h3" component="span" color="fg-3" sx={{ mx: '0.375rem' }}>
            <Trans>of</Trans>
          </Typography>
          <FormattedNumber value={cap.usd} symbol="USD" compact variant="h2" />
        </>
      )}
    </Box>
    <Typography
      variant="description"
      color="fg-3"
      component="div"
      sx={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', mt: '0.375rem' }}
    >
      <FormattedNumber value={amount} compact variant="description" color="fg-3" />
      {cap && (
        <>
          <Trans>of</Trans>
          <FormattedNumber value={cap.amount.value} compact variant="description" color="fg-3" />
        </>
      )}
      <span>{symbol}</span>
    </Typography>
  </>
);
