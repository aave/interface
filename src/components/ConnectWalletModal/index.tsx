import React from 'react';
// import { useIntl } from 'react-intl';

import {
  AvailableWeb3Connectors,
  ConnectWalletModalProps,
  getWeb3ProviderFromBrowser,
} from '../../libs/web3-data-provider';

// import WarningArea from '../WarningArea';
// import Link from '../basic/Link';
import UnlockWalletWrapper from './components/ConnectWalletWrapper';
import WalletCard from './components/WalletCard';
// import LedgerChecklist from './components/LedgerChecklist';
import SelectPreferredNetwork from './components/SelectPreferredNetwork';

// import { UnlockWalletExtraText } from '../../ui-config';

import messages from './messages';
import staticStyles from './style';

import * as icons from './images';
import { ChainId } from '@aave/contract-helpers';

export interface Wallet {
  title: string;
  description?: string;
  providerName: AvailableWeb3Connectors;
  icon: string;
  disabled?: boolean;
  notSupported?: boolean;
  errorMessage?: string;
}

export default function ConnectWalletModal({
  preferredChainId,
  onSelectPreferredChainId,
  supportedChainIds,
  onUnlockExternalWallet,
  error,
  showLedgerBanner,
  isVisible,
  onBackdropPress,
}: ConnectWalletModalProps) {
  // const intl = useIntl();
  const browserWalletProvider = getWeb3ProviderFromBrowser();

  const handleUnlockExternalWallet = (providerName: AvailableWeb3Connectors) =>
    onUnlockExternalWallet(
      providerName,
      preferredChainId,
      supportedChainIds,
      false
    );

  // @ts-ignore
  const isImToken = !!window.imToken;

  const wallets: Wallet[] = [
    {
      title: 'test wallet', 
      // intl.formatMessage(messages.titleBrowserWallet, {
      //   walletName: isImToken ? 'imToken' : 'Browser',
      // }),
      description: '(MetaMask, Trustwallet, Enjin)',
      providerName: 'browser',
      icon: isImToken ? icons.imToken : icons.browserWallets,
      disabled: !browserWalletProvider,
      errorMessage: 'error message'//intl.formatMessage(messages.noBrowserBrowserWallet),
    },
    {
      title: 'MEW wallet',
      providerName: 'mew-wallet',
      icon: icons.MEWIcon,
      notSupported: preferredChainId !== ChainId.mainnet,
    },
    {
      title: 'Coinbase',
      providerName: 'wallet-link',
      icon: icons.coinbaseIcon,
      notSupported: preferredChainId === ChainId.avalanche,
    },
    {
      title: 'Wallet Connect',
      providerName: 'wallet-connect',
      icon: icons.walletConnectIcon,
    },
    {
      title: 'Torus',
      providerName: 'torus',
      icon: icons.torusIcon,
      notSupported: preferredChainId === ChainId.avalanche,
    },
    {
      title: 'imToken',
      providerName: 'wallet-connect',
      icon: icons.imToken,
      notSupported:
        isImToken || preferredChainId === ChainId.polygon || preferredChainId === ChainId.avalanche,
    },
    {
      title: 'frame',
      providerName: 'frame',
      icon: icons.browserWallets,
      notSupported: preferredChainId !== ChainId.mainnet,
    },
  ];

  return (
    <UnlockWalletWrapper
      isVisible={isVisible}
      onBackdropPress={onBackdropPress}
      className="ConnectWalletModal"
    >
      <SelectPreferredNetwork
        preferredNetwork={preferredChainId}
        onSelectPreferredNetwork={onSelectPreferredChainId}
        supportedNetworks={supportedChainIds}
      />

      {/* {error && (
        <WarningArea
          className="ConnectWalletModal__warningArea ConnectWalletModal__warningArea-mobile"
          title={intl.formatMessage(messages.errorCaption)}
        >
          <p>{error}</p>
        </WarningArea>
      )} */}

      {/* {(error?.includes('Ledger') || showLedgerBanner) && (
        <LedgerChecklist className="ConnectWalletModal__LedgerChecklist-mobile" />
      )} */}

      <div className="ConnectWalletModal__content">
        {wallets
          .filter((wallet) => !wallet.notSupported)
          .map((wallet, index) => (
            <WalletCard
              title={wallet.title}
              description={wallet.description}
              errorMessage={
                wallet.providerName === 'browser' && !browserWalletProvider
                  ? wallet.errorMessage
                  : ''
              }
              providerName={wallet.providerName}
              icon={wallet.icon}
              disabled={wallet.disabled}
              handleUnlockExternalWallet={handleUnlockExternalWallet}
              key={index}
            />
          ))}
      </div>

      {/* {error && (
        <WarningArea
          className="ConnectWalletModal__warningArea"
          title={intl.formatMessage(messages.errorCaption)}
        >
          <p>{error}</p>
        </WarningArea>
      )} */}

      {/* {(error?.includes('Ledger') || showLedgerBanner) && (
        <LedgerChecklist className="ConnectWalletModal__warningArea" />
      )} */}

      {/* <div className="ConnectWalletModal__privacy-inner"> */}
        {/* <p>
          {intl.formatMessage(messages.needHelp, {
            readOurFAQ: (
              <Link
                to="https://docs.aave.com/faq/troubleshooting"
                title={intl.formatMessage(messages.readOurFAQ)}
                absolute={true}
                inNewWindow={true}
                bold={true}
                color="secondary"
              />
            ),
          })}
        </p> */}
        {/* <p>
          <UnlockWalletExtraText intl={intl} />
        </p> */}
        {/* <p>
          {intl.formatMessage(messages.disclaimerBottomText, {
            disclaimer: <span key="disclaimer">{intl.formatMessage(messages.disclaimer)}</span>,
          })}
        </p> */}
      {/* </div> */}

      <style jsx={true} global={true}>
        {staticStyles}
      </style>
    </UnlockWalletWrapper>
  );
}
