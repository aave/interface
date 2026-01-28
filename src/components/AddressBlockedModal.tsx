import { ExclamationCircleIcon, LogoutIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';

import { BasicModal } from './primitives/BasicModal';

export interface AddressBlockedProps {
  address: string;
  onDisconnectWallet: () => void;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const AddressBlockedModal = ({
  address,
  onDisconnectWallet,
  isError = false,
  errorMessage,
  onRetry,
}: AddressBlockedProps) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const setOpen = (_value: boolean) => {}; // ignore, we want the modal to not be dismissable

  const description = isError ? (
    errorMessage || <Trans>Something went wrong. Please try again later.</Trans>
  ) : (
    <Trans>
      Sorry, we are unable to connect your wallet. <br />
      Please try again with another wallet or contact support.
    </Trans>
  );

  return (
    <BasicModal open={true} withCloseButton={false} setOpen={setOpen}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SvgIcon sx={{ fontSize: '24px', color: 'warning.main', mb: 2 }}>
          <ExclamationCircleIcon />
        </SvgIcon>
        <Typography variant="h2">
          <Trans>Connection Failed</Trans>
        </Typography>
        <Typography variant="helperText" sx={{ my: 4 }}>
          {address}
        </Typography>
        <Typography variant="description" sx={{ textAlign: 'center', mb: 4 }}>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isError && onRetry && (
            <Button variant="outlined" onClick={onRetry}>
              <Trans>Retry</Trans>
            </Button>
          )}
          <Button variant="contained" onClick={onDisconnectWallet}>
            <SvgIcon fontSize="small" sx={{ mx: 1 }}>
              <LogoutIcon />
            </SvgIcon>
            <Trans>Disconnect Wallet</Trans>
          </Button>
        </Box>
      </Box>
    </BasicModal>
  );
};
