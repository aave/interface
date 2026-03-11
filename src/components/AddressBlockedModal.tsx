import { ExclamationCircleIcon, LogoutIcon, RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { BasicModal } from './primitives/BasicModal';

export interface AddressBlockedProps {
  address: string;
  onDisconnectWallet: () => void;
  isError?: boolean;
  onRetry?: () => void;
}

export const AddressBlockedModal = ({
  address,
  onDisconnectWallet,
  isError = false,
  onRetry,
}: AddressBlockedProps) => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const setOpen = (_value: boolean) => {}; // ignore, we want the modal to not be dismissable
  const [setFeedbackOpen, setSupportPrefillMessage] = useRootStore(
    useShallow((state) => [state.setFeedbackOpen, state.setSupportPrefillMessage])
  );
  const handleGetSupport = () => {
    const walletAddress = address ? address : 'Address not available';
    const template = `Unable to Connect:\n\n"${walletAddress}"`;

    setSupportPrefillMessage(template);
    setFeedbackOpen(true);
    close();
  };
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
          {isError ? <Trans>Connection Error</Trans> : <Trans>Unable to Connect</Trans>}
        </Typography>
        <Typography variant="helperText" sx={{ my: 4 }}>
          {address}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isError && onRetry && (
            <Button variant="contained" onClick={onRetry}>
              <SvgIcon fontSize="small" sx={{ mx: 1 }}>
                <RefreshIcon />
              </SvgIcon>
              <Trans>Refresh</Trans>
            </Button>
          )}

          <Button variant="contained" onClick={handleGetSupport} size="small">
            <Trans>Get support</Trans>
          </Button>
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
