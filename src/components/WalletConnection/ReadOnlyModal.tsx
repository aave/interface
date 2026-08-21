import { Trans } from '@lingui/macro';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { ReadOnlyModeTooltip } from 'src/components/infoTooltips/ReadOnlyModeTooltip';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { resolveEnsAddress } from 'src/utils/ensClient';
import { AUTH } from 'src/utils/events';
import { isAddress } from 'viem';
import { useAccount, useDisconnect } from 'wagmi';

import { BasicModal } from '../primitives/BasicModal';
import { TxModalTitle } from '../transactions/FlowCommons/TxModalTitle';

export const ReadOnlyModal = () => {
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { readOnlyMode, setReadOnlyModeAddress } = useWeb3Context();
  const [inputMockWalletAddress, setInputMockWalletAddress] = useState('');
  const [validAddressError, setValidAddressError] = useState<boolean>(false);
  const { type, close } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleReadAddress = async (inputMockWalletAddress: string): Promise<void> => {
    if (validAddressError) setValidAddressError(false);
    if (isAddress(inputMockWalletAddress)) {
      saveAndClose(inputMockWalletAddress);
    } else {
      // Check if address could be valid ENS before trying to resolve
      const resolvedAddress = await resolveEnsAddress(inputMockWalletAddress);
      if (resolvedAddress && isAddress(resolvedAddress)) {
        saveAndClose(resolvedAddress);
      } else {
        setValidAddressError(true);
      }
    }
  };

  const saveAndClose = async (address: string) => {
    if (isConnected) {
      await disconnectAsync();
    }

    setReadOnlyModeAddress(address);
    localStorage.setItem('readOnlyModeAddress', address);
    handleClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleReadAddress(inputMockWalletAddress);
  };

  const handleRemoveWatchedAddress = async () => {
    localStorage.removeItem('readOnlyModeAddress');
    setReadOnlyModeAddress(undefined);
    handleClose();
  };

  const handleClose = () => {
    setInputMockWalletAddress('');
    close();
  };

  return (
    <BasicModal open={type === ModalType.ReadMode} setOpen={handleClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <TxModalTitle title="Watch Wallet" sx={{ mb: '2rem' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.75rem' }}>
          <Typography variant="caption" sx={{ color: 'fg-3', lineHeight: '135%' }}>
            <Trans>Watch a wallet balance in read-only mode</Trans>
          </Typography>
          <ReadOnlyModeTooltip />
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            size="small"
            placeholder="Enter ethereum address or ENS name"
            value={inputMockWalletAddress}
            onChange={(e) => setInputMockWalletAddress(e.target.value)}
            inputProps={{ 'aria-label': 'read-only mode address' }}
            sx={{ mb: '2rem' }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mb: '8px' }}
            fullWidth
            onClick={() => trackEvent(AUTH.MOCK_WALLET)}
            aria-label="read-only mode address"
          >
            <Trans>Watch wallet</Trans>
          </Button>
        </form>
        {validAddressError && (
          <Typography variant="helperText" color="error.main">
            <Trans>Please enter a valid wallet address.</Trans>
          </Typography>
        )}
        {readOnlyMode && (
          <Button sx={{ mt: 2 }} variant="tertiary" onClick={handleRemoveWatchedAddress}>
            Remove watched address
          </Button>
        )}
      </Box>
    </BasicModal>
  );
};
