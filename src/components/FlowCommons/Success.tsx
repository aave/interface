import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';

export type SuccessTxViewProps = {
  action?: string;
  amount?: string;
  symbol: string;
  collateral?: boolean;
};

export const TxSuccessView = ({ action, amount, symbol, collateral }: SuccessTxViewProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          width: '48px',
          height: '48px',
          color: 'green',
          backgroundColor: '#ECF8ED',
          borderRadius: '50%',
        }}
      >
        <SvgIcon sx={{ color: 'green' }} fontSize="medium">
          <CheckIcon />
        </SvgIcon>
      </Box>
      <Typography sx={{ mt: '16px' }} variant="h2">
        <Trans>All done!</Trans>
      </Typography>
      {action && amount && (
        <Typography sx={{ mt: '8px' }} variant="description">
          <Trans>
            You {action} {amount} {symbol}
          </Trans>
        </Typography>
      )}
      {!action && !amount && (
        <Typography variant="description">
          Your {symbol} {collateral ? 'now' : 'is not'} used as collateral
        </Typography>
      )}
    </Box>
  );
};
