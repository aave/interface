import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';

export type SuccessTxViewProps = {
  action: string;
  amount: string;
  symbol: string;
};

export const TxSuccessView = ({ action, amount, symbol }: SuccessTxViewProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
      <Typography sx={{ mt: '8px' }} variant="description">
        <Trans>
          You {action} {amount} {symbol}
        </Trans>
      </Typography>
    </Box>
  );
};
