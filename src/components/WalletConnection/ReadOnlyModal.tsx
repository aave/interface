import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Divider,
  InputBase,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { utils } from 'ethers';
import { useState } from 'react';
import { ReadOnlyModeTooltip } from 'src/components/infoTooltips/ReadOnlyModeTooltip';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getENSProvider } from 'src/utils/marketsAndNetworksConfig';
import { AUTH } from 'src/utils/mixPanelEvents';
import { normalize } from 'viem/ens';
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
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const mainnetProvider = getENSProvider();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleReadAddress = async (inputMockWalletAddress: string): Promise<void> => {
    if (validAddressError) setValidAddressError(false);
    if (utils.isAddress(inputMockWalletAddress)) {
      saveAndClose(inputMockWalletAddress);
    } else {
      // Check if address could be valid ENS before trying to resolve
      if (inputMockWalletAddress.slice(-4) === '.eth') {
        const normalizedENS = normalize(inputMockWalletAddress);
        // Attempt to resolve ENS name and use resolved address if valid
        const resolvedAddress = await mainnetProvider.resolveName(normalizedENS);
        if (resolvedAddress && utils.isAddress(resolvedAddress)) {
          saveAndClose(resolvedAddress);
        } else {
          setValidAddressError(true);
        }
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
        <TxModalTitle title="Watch Wallet" />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, padding: '10px 0' }}>
          <Typography variant="subheader1" color="text.secondary">
            <Trans>Watch a wallet balance in read-only mode</Trans>
          </Typography>
          <ReadOnlyModeTooltip />
        </Box>
        <form onSubmit={handleSubmit}>
          <InputBase
            sx={(theme) => ({
              py: 1,
              px: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '6px',
              mb: 1,
              overflow: 'show',
              fontSize: sm ? '16px' : '14px',
            })}
            placeholder="Enter ethereum address or ENS name"
            fullWidth
            value={inputMockWalletAddress}
            onChange={(e) => setInputMockWalletAddress(e.target.value)}
            inputProps={{
              'aria-label': 'read-only mode address',
            }}
          />
          <Button
            type="submit"
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              mb: '8px',
            }}
            size="large"
            fullWidth
            onClick={() => trackEvent(AUTH.MOCK_WALLET)}
            disabled={
              !utils.isAddress(inputMockWalletAddress) &&
              inputMockWalletAddress.slice(-4) !== '.eth'
            }
            aria-label="read-only mode address"
          >
            <Trans>Track wallet</Trans>
          </Button>
        </form>
        {validAddressError && (
          <Typography variant="helperText" color="error.main">
            <Trans>Please enter a valid wallet address.</Trans>
          </Typography>
        )}
        {readOnlyMode && (
          <>
            <Divider />
            <Button sx={{ mt: 2 }} variant="outlined" onClick={handleRemoveWatchedAddress}>
              Remove watched address
            </Button>
          </>
        )}
      </Box>
    </BasicModal>
  );
};
