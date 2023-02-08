import { Trans } from '@lingui/macro';
import { Box, Button, InputBase, Link, Typography, useMediaQuery, useTheme } from '@mui/material';
import { UnsupportedChainIdError } from '@web3-react/core';
import { NoEthereumProviderError } from '@web3-react/injected-connector';
import { utils } from 'ethers';
import { useState } from 'react';
import { ReadOnlyModeTooltip } from 'src/components/infoTooltips/ReadOnlyModeTooltip';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { UserRejectedRequestError } from 'src/libs/web3-data-provider/WalletConnectConnector';
import { WalletType } from 'src/libs/web3-data-provider/WalletOptions';
import { getENSProvider } from 'src/utils/marketsAndNetworksConfig';

import { Warning } from '../primitives/Warning';
import { TxModalTitle } from '../transactions/FlowCommons/TxModalTitle';

export type WalletRowProps = {
  walletName: string;
  walletType: WalletType;
};

const WalletRow = ({ walletName, walletType }: WalletRowProps) => {
  const { connectWallet } = useWeb3Context();

  const getWalletIcon = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.INJECTED:
        return (
          <img
            src={`/icons/wallets/browserWallet.svg`}
            width="24px"
            height="24px"
            alt={`browser wallet icon`}
          />
        );
      case WalletType.WALLET_CONNECT:
        return (
          <img
            src={`/icons/wallets/walletConnect.svg`}
            width="24px"
            height="24px"
            alt={`browser wallet icon`}
          />
        );
      case WalletType.WALLET_LINK:
        return (
          <img
            src={`/icons/wallets/coinbase.svg`}
            width="24px"
            height="24px"
            alt={`browser wallet icon`}
          />
        );
      case WalletType.TORUS:
        return (
          <img
            src={`/icons/wallets/torus.svg`}
            width="24px"
            height="24px"
            alt={`browser wallet icon`}
          />
        );
      case WalletType.FRAME:
        return (
          <img
            src={`/icons/wallets/frame.svg`}
            width="24px"
            height="24px"
            alt={`browser wallet icon`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Button
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        mb: '8px',
      }}
      size="large"
      onClick={() => connectWallet(walletType)}
      endIcon={getWalletIcon(walletType)}
    >
      {walletName}
    </Button>
  );
};

export enum ErrorType {
  UNSUPORTED_CHAIN,
  USER_REJECTED_REQUEST,
  UNDETERMINED_ERROR,
  NO_WALLET_DETECTED,
}

export const WalletSelector = () => {
  const { error, connectReadOnlyMode } = useWeb3Context();
  const [inputMockWalletAddress, setInputMockWalletAddress] = useState('');
  const [validAddressError, setValidAddressError] = useState<boolean>(false);
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const mainnetProvider = getENSProvider();

  let blockingError: ErrorType | undefined = undefined;
  if (error) {
    if (error instanceof UnsupportedChainIdError) {
      blockingError = ErrorType.UNSUPORTED_CHAIN;
    } else if (error instanceof UserRejectedRequestError) {
      blockingError = ErrorType.USER_REJECTED_REQUEST;
    } else if (error instanceof NoEthereumProviderError) {
      blockingError = ErrorType.NO_WALLET_DETECTED;
    } else {
      blockingError = ErrorType.UNDETERMINED_ERROR;
    }
    // TODO: add other errors
  }

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
      connectReadOnlyMode(inputMockWalletAddress);
    } else {
      // Check if address could be valid ENS before trying to resolve
      if (inputMockWalletAddress.slice(-4) !== '.eth') {
        setValidAddressError(true);
      } else {
        // Attempt to resolve ENS name and use resolved address if valid
        const resolvedAddress = await mainnetProvider.resolveName(inputMockWalletAddress);
        if (resolvedAddress && utils.isAddress(resolvedAddress)) {
          connectReadOnlyMode(resolvedAddress);
        } else {
          setValidAddressError(true);
        }
      }
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    handleReadAddress(inputMockWalletAddress);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TxModalTitle title="Connect a wallet" />
      {error && <Warning severity="error">{handleBlocking()}</Warning>}
      <WalletRow
        key="browser_wallet"
        walletName="Browser wallet"
        walletType={WalletType.INJECTED}
      />
      <WalletRow
        key="walletconnect_wallet"
        walletName="WalletConnect"
        walletType={WalletType.WALLET_CONNECT}
      />
      <WalletRow
        key="walletlink_wallet"
        walletName="Coinbase Wallet"
        walletType={WalletType.WALLET_LINK}
      />
      <WalletRow key="torus_wallet" walletName="Torus" walletType={WalletType.TORUS} />
      <WalletRow key="frame_wallet" walletName="Frame" walletType={WalletType.FRAME} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, padding: '10px 0' }}>
        <Typography variant="subheader1" color="text.secondary">
          <Trans>Track wallet balance in read-only mode</Trans>
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
          placeholder="Ethereum address or ENS name"
          fullWidth
          autoFocus
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
          disabled={
            !utils.isAddress(inputMockWalletAddress) && inputMockWalletAddress.slice(-4) !== '.eth'
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
      <Typography variant="description" sx={{ mt: '22px', mb: '30px', alignSelf: 'center' }}>
        <Trans>
          Need help connecting a wallet?{' '}
          <Link href="https://docs.aave.com/faq/troubleshooting" target="_blank" rel="noopener">
            Read our FAQ
          </Link>
        </Trans>
      </Typography>
      <Typography variant="helperText">
        <Trans>
          Wallets are provided by External Providers and by selecting you agree to Terms of those
          Providers. Your access to the wallet might be reliant on the External Provider being
          operational.
        </Trans>
      </Typography>
    </Box>
  );
};
