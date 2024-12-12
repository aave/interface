import { Trans } from '@lingui/macro';
import { Box, Button, InputBase, Typography, useMediaQuery, useTheme } from '@mui/material';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';
import { ReadOnlyModeTooltip } from 'src/components/infoTooltips/ReadOnlyModeTooltip';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getENSProvider } from 'src/utils/marketsAndNetworksConfig';
import { AUTH } from 'src/utils/mixPanelEvents';
import { mock, useConnect } from 'wagmi';

import { BasicModal } from '../primitives/BasicModal';
import { Warning } from '../primitives/Warning';
import { TxModalTitle } from '../transactions/FlowCommons/TxModalTitle';

export enum ErrorType {
  UNSUPORTED_CHAIN,
  USER_REJECTED_REQUEST,
  UNDETERMINED_ERROR,
  NO_WALLET_DETECTED,
}

// TODO: remove
class NoMetaMaskError {}
class UserRejectedRequestError {}

export const ReadOnlyModal = () => {
  const { connect } = useConnect();
  const { error } = useWeb3Context();
  const [inputMockWalletAddress, setInputMockWalletAddress] = useState('');
  const [validAddressError, setValidAddressError] = useState<boolean>(false);
  const { type, close } = useModalContext();
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const mainnetProvider = getENSProvider();
  const trackEvent = useRootStore((store) => store.trackEvent);

  let blockingError: ErrorType | undefined = undefined;
  if (error) {
    if (error instanceof UserRejectedRequestError) {
      blockingError = ErrorType.UNSUPORTED_CHAIN;
    } else if (error instanceof UserRejectedRequestError) {
      blockingError = ErrorType.USER_REJECTED_REQUEST;
    } else if (error instanceof NoMetaMaskError) {
      blockingError = ErrorType.NO_WALLET_DETECTED;
    } else {
      blockingError = ErrorType.UNDETERMINED_ERROR;
    }
    // TODO: add other errors
  }

  useEffect(() => {
    const readOnlyAddress = localStorage.getItem('readOnlyModeAddress');
    if (readOnlyAddress) {
      connect({ connector: mock({ accounts: [readOnlyAddress as `0x${string}`] }) });
    }
  }, [connect]);

  const handleBlocking = () => {
    switch (blockingError) {
      case ErrorType.UNSUPORTED_CHAIN:
        return <Trans>Network not supported for this wallet</Trans>;
      case ErrorType.USER_REJECTED_REQUEST:
        return <Trans>Rejected connection request</Trans>;
      case ErrorType.NO_WALLET_DETECTED:
        return <Trans>Wallet not detected. Connect or install wallet and retry</Trans>;
      default:
        console.log('Uncatched error: ', error);
        return <Trans>Error connecting. Try refreshing the page.</Trans>;
    }
  };

  const handleReadAddress = async (inputMockWalletAddress: string): Promise<void> => {
    if (validAddressError) setValidAddressError(false);
    if (utils.isAddress(inputMockWalletAddress)) {
      localStorage.setItem('readOnlyModeAddress', inputMockWalletAddress);
      connect({ connector: mock({ accounts: [inputMockWalletAddress as `0x${string}`] }) });
      close();
    } else {
      // Check if address could be valid ENS before trying to resolve
      if (inputMockWalletAddress.slice(-4) === '.eth') {
        // Attempt to resolve ENS name and use resolved address if valid
        const resolvedAddress = await mainnetProvider.resolveName(inputMockWalletAddress);
        if (resolvedAddress && utils.isAddress(resolvedAddress)) {
          localStorage.setItem('readOnlyModeAddress', inputMockWalletAddress);
          connect({ connector: mock({ accounts: [inputMockWalletAddress as `0x${string}`] }) });
          close();
        } else {
          setValidAddressError(true);
        }
      } else {
        setValidAddressError(true);
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleReadAddress(inputMockWalletAddress);
  };

  return (
    <BasicModal open={type === ModalType.ReadMode} setOpen={close}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <TxModalTitle title="Watch Wallet" />
        {error && <Warning severity="error">{handleBlocking()}</Warning>}
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
      </Box>
    </BasicModal>
  );
};
