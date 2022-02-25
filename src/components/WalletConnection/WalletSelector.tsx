import { Alert, Box, Button, Link, SvgIcon, Typography } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { WalletType } from 'src/libs/web3-data-provider/WalletOptions';
import { TxModalTitle } from '../transactions/FlowCommons/TxModalTitle';

import BrowserWalletIcon from '/public/icons/wallets/BrowserWallet.svg';
import TorusIcon from '/public/icons/wallets/Torus.svg';
import WalletConnectIcon from '/public/icons/wallets/WalletConnect.svg';
import CoinbaseIcon from '/public/icons/wallets/Coinbase.svg';

import { Trans } from '@lingui/macro';
import { UnsupportedChainIdError } from '@web3-react/core';
import { UserRejectedRequestError } from '@web3-react/walletconnect-connector';

export type WalletRowProps = {
  walletName: string;
  walletType: WalletType;
};

const WalletRow = ({ walletName, walletType }: WalletRowProps) => {
  const { connectWallet } = useWeb3Context();

  const getWalletIcon = (walletType: WalletType) => {
    switch (walletType) {
      case WalletType.INJECTED:
        return <BrowserWalletIcon />;
      case WalletType.WALLET_CONNECT:
        return <WalletConnectIcon />;
      case WalletType.WALLET_LINK:
        return <CoinbaseIcon />;
      case WalletType.TORUS:
        return <TorusIcon />;
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
      onClick={() => connectWallet(walletType)}
    >
      <Typography variant="buttonL">{walletName}</Typography>
      <SvgIcon>{getWalletIcon(walletType)}</SvgIcon>
    </Button>
  );
};

export enum ErrorType {
  UNSUPORTED_CHAIN,
  USER_REJECTED_REQUEST,
}

export const WalletSelector = () => {
  const { error } = useWeb3Context();

  let blockingError: ErrorType | undefined = undefined;
  if (error) {
    if (error instanceof UnsupportedChainIdError) {
      blockingError = ErrorType.UNSUPORTED_CHAIN;
    } else if (error instanceof UserRejectedRequestError) {
      blockingError = ErrorType.USER_REJECTED_REQUEST;
    }
    // TODO: add other errors
  }

  const handleBlocking = () => {
    switch (blockingError) {
      case ErrorType.UNSUPORTED_CHAIN:
        return <Trans>Network not supported for this wallet</Trans>;
      case ErrorType.USER_REJECTED_REQUEST:
        return <Trans>Rejected connection request</Trans>;
      default:
        console.log('Uncatched error: ', error);
        return <Trans>Error connecting. Try refreshing the page.</Trans>;
    }
  };

  console.log('wallet selector error::: ', error);

  return (
    <Box>
      <TxModalTitle title="Connect a wallet" />
      {error && (
        <Alert severity="error" sx={{ mb: '24px' }}>
          {handleBlocking()}
        </Alert>
      )}
      <WalletRow walletName="Browser wallet" walletType={WalletType.INJECTED} />
      <WalletRow walletName="WalletConnect" walletType={WalletType.WALLET_CONNECT} />
      <WalletRow walletName="Coinbase" walletType={WalletType.WALLET_LINK} />
      <WalletRow walletName="Torus" walletType={WalletType.TORUS} />
      <WalletRow walletName="Frame" walletType={WalletType.FRAME} />
      <Typography variant="description" sx={{ mt: '22px', mb: '30px' }}>
        <Trans>
          Need help connecting a wallet? <Link>Read our FAQ</Link>
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
