import { useState } from 'react';
import { Alert, Box, Button, InputBase, Link, Typography } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { WalletType } from 'src/libs/web3-data-provider/WalletOptions';
import { WatchOnlyModeToolTip } from 'src/components/infoTooltips/WatchOnlyModeTooltip';
import { TxModalTitle } from '../transactions/FlowCommons/TxModalTitle';
import { Trans } from '@lingui/macro';
import { UnsupportedChainIdError } from '@web3-react/core';
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector';
import { NoEthereumProviderError } from '@web3-react/injected-connector';

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
  const { error, setMockWalletAddress } = useWeb3Context();
  const [inputMockWalletAddress, setInputMockWalletAddress] = useState('');

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TxModalTitle title="Connect a wallet" />
      {error && (
        <Alert severity="error" sx={{ mb: '24px' }}>
          {handleBlocking()}
        </Alert>
      )}
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
        walletName="Coinbase"
        walletType={WalletType.WALLET_LINK}
      />
      <WalletRow key="torus_wallet" walletName="Torus" walletType={WalletType.TORUS} />
      <WalletRow key="frame_wallet" walletName="Frame" walletType={WalletType.FRAME} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, padding: '10px 0' }}>
        <Typography variant="subheader1" color="text.secondary">
          <Trans>Enter an address to track in watch-only mode</Trans>
        </Typography>
        <WatchOnlyModeToolTip />
      </Box>
      <Box
        sx={(theme) => ({
          p: '8px 12px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
        })}
      >
        <InputBase
          sx={{ flex: 1, overflow: 'show', width: '100%' }}
          placeholder="Paste ethereum address"
          autoFocus
          value={inputMockWalletAddress}
          onChange={(e) => {
            setInputMockWalletAddress(e.target.value);
          }}
          inputProps={{
            'aria-label': 'amount input',
            style: {
              padding: 0,
            },
          }}
        />
      </Box>
      <Button
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          mb: '8px',
        }}
        size="large"
        onClick={() => setMockWalletAddress(inputMockWalletAddress)}
      >
        Watch address
      </Button>
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
