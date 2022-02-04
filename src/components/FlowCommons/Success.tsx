import { InterestRate } from '@aave/contract-helpers';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';

export type SuccessTxViewProps = {
  action?: string;
  amount?: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
};

export const TxSuccessView = ({ action, amount, symbol, collateral, rate }: SuccessTxViewProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        mb: '124px',
      }}
    >
      <Box
        sx={{
          width: '48px',
          height: '48px',
          color: 'green',
          backgroundColor: '#ECF8ED',
          borderRadius: '50%',
          mt: '48px',
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SvgIcon sx={{ color: 'green' }} fontSize="medium">
          <CheckIcon />
        </SvgIcon>
      </Box>
      <Typography sx={{ mt: '16px' }} variant="h2">
        <Trans>All done!</Trans>
      </Typography>
      {action && amount && symbol && (
        <Typography sx={{ mt: '8px' }} variant="description">
          <Trans>
            You {action} {amount} {symbol}
          </Trans>
        </Typography>
      )}
      {!action && !amount && symbol && (
        <Typography variant="description">
          Your {symbol} {collateral ? 'now' : 'is not'} used as collateral
        </Typography>
      )}
      {rate && (
        <Typography variant="description">
          <Trans>
            You switched to {rate === InterestRate.Variable ? 'variable' : 'stable'} rate
          </Trans>
        </Typography>
      )}
    </Box>
  );
};
