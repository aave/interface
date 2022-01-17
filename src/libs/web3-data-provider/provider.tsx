import React, { PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react';

// import AddressModal from '../../components/AddressModal';
import {
  AvailableWeb3Connectors,
  disconnectWeb3Connector,
  getWeb3Connector,
} from './connectors';
import {
  getReferralCode,
  getReferralCodeFromUrl,
  removeReferralCode,
  storeReferralCode,
} from '../referral-handler';


import { ChainId } from '@aave/contract-helpers';

// TODO: uncomment when data providers added
// import { useProtocolDataContext } from '../protocol-data-provider';



interface UserWalletData {
  availableAccounts: string[];
  currentAccount: string;
  disconnectWallet: (error?: Error) => void;
  // displaySwitchAccountModal: (reloadAccounts?: boolean) => void;
  showSelectWalletModal: () => void;
  currentProviderName: AvailableWeb3Connectors | undefined;
  handleNetworkChange: (network: ChainId) => void;
  handleUnlockWallet: (
    providerName: AvailableWeb3Connectors,
    chainId: ChainId,
    availableChainIds: ChainId[],
  ) => void;
}

const formattingError = (
  error: Error | undefined,
  supportedChainIds: ChainId[],
  // intl: IntlShape
) => {
  if (!error || !error.message) {
    return;
  }
  // Unsupported chain
  if (error.message.includes('Unsupported chain id:')) {
    // TODO use correct translator
    return `Supported networks: ${supportedChainIds.join(', ')}`
    // return intl.formatMessage(messages.unsupportedNetwork, {
    //   supportedChainIds: supportedChainIds.join(', '),
    // });
  }

  // Disconnected or locked ledger
  // if (error.message.includes('0x6804') || error.message.includes('0x6700')) {
  //   return intl.formatMessage(messages.ledgerDisconnected);
  // }
  // Ignore Ledger WebUSB errors: Invalid sequence or channel
  // if (error.message.includes('Invalid sequence') || error.message.includes('Invalid channel')) {
  //   return;
  // }

  return error.message;
};

const UserWalletDataContext = React.createContext({} as UserWalletData);

export const useUserWalletDataContext = () => useContext(UserWalletDataContext);

export interface UnlockWalletPreloaderProps {
  currentProviderName?: AvailableWeb3Connectors;
}

export interface ConnectWalletModalProps {
  preferredChainId: ChainId;
  // onSelectPreferredChainId: (chainId: ChainId) => void;
  supportedChainIds: ChainId[];
  onUnlockExternalWallet: (
    providerName: AvailableWeb3Connectors,
    chainId: ChainId,
    availableChainIds: ChainId[],
    // connectorConfig: ConnectorOptionalConfig,
    skipLoad?: boolean
  ) => void;
  // connectorConfig: ConnectorOptionalConfig;
  // error?: string;
  // showLedgerBanner?: boolean;
  isVisible: boolean;
  onBackdropPress: () => void;
}

interface Web3ProviderProps {
  supportedChainIds: ChainId[];
  // preloader: (props: { currentProviderName?: AvailableWeb3Connectors }) => JSX.Element;
  // connectWalletModal: (props: ConnectWalletModalProps) => JSX.Element;
}

export function Web3Provider({
  children,
  supportedChainIds,
}: PropsWithChildren<Web3ProviderProps>) {
  // const intl = useIntl();
  const { library, account, activate, error, deactivate } =
    useWeb3React<ethers.providers.Web3Provider>();

  let preferredChainId = 1;
  useEffect(() => {
    // Perform localStorage action
    preferredChainId = Number(localStorage.getItem('preferredChainId')) || 1;
  }, [])

  // TODO: uncomment when hook added
  // const { chainId } = useProtocolDataContext();
  const chainId = 1;

  const [currentProviderName, setCurrentProviderName] = useState<
    AvailableWeb3Connectors | undefined
  >();
  const [_preferredNetwork, setPreferredNetwork] = useState(
    preferredChainId as ChainId
  );
  const preferredNetwork = _preferredNetwork || chainId;
  const [activating, setActivation] = useState(true);
  const [isSelectWalletModalVisible, setSelectWalletModalVisible] = useState(false);
  const [isErrorDetected, setErrorDetected] = useState(false);

  // const formattedError = formattingError(error, supportedChainIds, intl);
  const formattedError = 'Test error to change when intl enabled'

  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  // const [displaySwitchAccountModal, setDisplaySwitchAccountModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [mockWalletAddress, setMockWalletAddress] = useState('');

  const [isAvailableAccountsLoading, setIsAvailableAccountsLoading] = useState(false);
  // const [connectorOptionalConfig, setConnectorOptionalConfig] = useState<ConnectorOptionalConfig>(
  //   ledgerConfigStoredDefaults
  // );
  // TODO: most probably useless, check it and remove
  const [showLedgerBanner, setLedgerBanner] = useState(false);

  /** Handlers */
  const handleActivation = async (
    connectorName: AvailableWeb3Connectors,
    network: ChainId,
    availableNetworks: ChainId[],
  ): Promise<boolean> => {
    let isSuccessful = false;
    setActivation(true);
    console.log(network);
    //TODO: maybe next line is useless
    localStorage.setItem('preferredChainId', network as unknown as string);
    try {
      await activate(
        getWeb3Connector(connectorName, network, availableNetworks),
        () => {},
        true
      );
      setCurrentProviderName(connectorName);
      isSuccessful = true;
    } catch (e) {
      console.log('error on activation', e);
      disconnectWallet(e as Error);
    }
    setActivation(false);
    return isSuccessful;
  };

  const handleNetworkChange = async (network: ChainId) => {
    setPreferredNetwork(network);
    localStorage.setItem('preferredChainId', network as unknown as string);
    if (currentProviderName && library) {
      return await handleActivation(
        currentProviderName,
        network,
        supportedChainIds,
      );
    }
  };

  // const handleAccountsListLoading = async (
  //   provider?: ethers.providers.Web3Provider,
  //   retries = 0
  // ) => {
  //   // Implement a retry system to prevent users to infinitely load Aave page during a connection issue.
  //   if (retries <= 0) {
  //     const error = new Error(
  //       '[Aave][Web3Provider] Max account reload reached. Clearing app state. Ask Aave support channels if you encounter this error.'
  //     );
  //     // Clear state and disconnect wallet
  //     setIsAvailableAccountsLoading(false);
  //     setDisplaySwitchAccountModal(false);
  //     disconnectWallet(error);

  //     console.error(error);
  //     return;
  //   }
  //   // Lock the `handleAccountsListLoading` function if accounts are loading, to prevent spamming `await provider.listAccounts()`
  //   // and saturating the Web3 provider connection.
  //   if (provider && !isAvailableAccountsLoading) {
  //     setIsAvailableAccountsLoading(true);
  //     let accounts: string[] = [];
  //     try {
  //       accounts = provider ? await provider.listAccounts() : [];
  //     } catch (error) {
  //       // Catch any Web3 load error or Ledger connection error when the app tries to connect prior connecting to the USB device
  //       // Hold the retry until 3 segs if there is an error loading accounts,
  //       // to prevent spamming the Ledger Web USB channel and block the connection.
  //       setTimeout(async () => {
  //         console.log('[Aave][Web3Provider] Retrying Web3 connection.');
  //         await handleAccountsListLoading(provider, retries - 1);
  //       }, 3000);
  //       return;
  //     }
  //     const storedAccount = localStorage.getItem('selectedAccount');
  //     setAvailableAccounts(accounts);
  //     // TODO: most probably lower case useless, keeping it just in case
  //     if (
  //       storedAccount &&
  //       accounts.map((acc) => acc.toLowerCase()).includes(storedAccount.toLowerCase())
  //     ) {
  //       // If loaded account and local storage account matches, set the account
  //       handleSetCurrentAccount(storedAccount);
  //     } else {
  //       if (accounts.length > 1) {
  //         setDisplaySwitchAccountModal(true);
  //       } else {
  //         // If storage does not match loaded accounts and is not a Ledger provider, them use first account from loaded accounts
  //         handleSetCurrentAccount(accounts.length === 1 ? accounts[0] : '');
  //       }
  //     }
  //     setIsAvailableAccountsLoading(false);
  //   }
  // };

  // const handleSetCurrentAccount = (account: string) => {
  //   setCurrentAccount(account);
  //   localStorage.setItem('selectedAccount', account);
  // };

  // const openAccountSelector = (reloadAccounts = false) => {
  //   setDisplaySwitchAccountModal((currentValue) => {
  //     if (!currentValue) {
  //       if (reloadAccounts && currentProviderName) {
  //         handleActivation(
  //           currentProviderName,
  //           preferredNetwork,
  //           supportedChainIds
  //         );
  //       }
  //       return true;
  //     }
  //     return currentValue;
  //   });
  // };

  const handleUnlockWallet = useCallback(
    async (
      connectorName: AvailableWeb3Connectors,
      chainId: ChainId,
      availableChainIds: ChainId[],
      // connectorConfig: ConnectorOptionalConfig
    ) => {
      if (await handleActivation(connectorName, chainId, availableChainIds)) {
        setSelectWalletModalVisible(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  
  const disconnectWallet = (error?: Error) => {
    disconnectWeb3Connector();
    setAvailableAccounts([]);
    setCurrentAccount('');
    setCurrentProviderName(undefined);
    deactivate();
    if (error?.message?.includes('Ledger')) {
      setLedgerBanner(true);
    }
    // setDisplaySwitchAccountModal(false);
  };
  /** End of Handlers */

  /** Side effects */
  useEffect(() => {
    setMockWalletAddress(localStorage.getItem('mockWalletAddress') || '');
  }, []);

  // try to check on the startapp, if we're in the gnosis iFrame - activate this provider
  useEffect(() => {
    const safeAppConnector = new SafeAppConnector();

    safeAppConnector.isSafeApp().then((isSafeApp) => {
      let storedProviderName = localStorage.getItem('currentProvider') as
        | AvailableWeb3Connectors
        | undefined;
      if (isSafeApp) {
        storedProviderName = 'gnosis-safe';
      } else if (storedProviderName === 'gnosis-safe') {
        storedProviderName = undefined;
      }
      if (storedProviderName) {
        console.log('storedProviderName', storedProviderName);
        setCurrentProviderName(storedProviderName);
        handleUnlockWallet(
          storedProviderName,
          preferredNetwork,
          supportedChainIds,
        );
      } else {
        setCurrentAccount('');
        setActivation(false);
      }
    });
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  // store chosen provider name in localStorage after update
  useEffect(() => {
    if (account && currentProviderName) {
      localStorage.setItem('currentProvider', currentProviderName);

      // we're providing referral fee for imToken if it's used over WalletConnect as well
      // @ts-ignore
      const providerPeerName = (library?.provider?.wc?.peerMeta?.name || '') as string;
      const storedReferral = getReferralCode();
      const isImTokenOverWC = providerPeerName === 'imToken';
      // if user used imToken and switching to another we remove their referral code
      if (storedReferral === '23' && !isImTokenOverWC && getReferralCodeFromUrl() !== '23') {
        removeReferralCode();
        // if traffic comes from some another referral we will not set imToken referral id
      } else if (isImTokenOverWC && !storedReferral) {
        storeReferralCode(23, false);
      }
      // else if (!account && currentProviderName) {
      //   openAccountSelector();
      // }
      // handleAccountsListLoading(library, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, currentProviderName, handleUnlockWallet, library]);

  useEffect(() => {
    if (formattedError) {
      setErrorDetected(true);
    } else {
      setErrorDetected(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedError, currentAccount]);
  /** End of side effects */

  // if (activating || isAvailableAccountsLoading) {
  //   return <Preloader currentProviderName={currentProviderName} />;
  // }

  return (
    <UserWalletDataContext.Provider
      value={{
        availableAccounts,
        disconnectWallet,
        currentAccount:
          currentAccount && mockWalletAddress
            ? mockWalletAddress.toLowerCase()
            : currentAccount.toLowerCase(),
        // displaySwitchAccountModal: (reloadAccounts) => {
        //   openAccountSelector(reloadAccounts);
        // },
        showSelectWalletModal: () => setSelectWalletModalVisible(true),
        currentProviderName,
        handleNetworkChange,
        handleUnlockWallet

        // preferredChainId:preferredNetwork,
        // onSelectPreferredChainId: handleNetworkChange,
        // supportedChainIds:supportedChainIds
      }}
    >
      {/* <AddressModal
        showModal={displaySwitchAccountModal}
        setModal={(val: boolean) => {
          setDisplaySwitchAccountModal(val);
        }}
        onBackdropPress={
          !account || !library || (availableAccounts.length > 1 && !currentAccount)
            ? disconnectWallet
            : () => setDisplaySwitchAccountModal(false)
        }
        activeAddress={currentAccount}
        availableAddresses={availableAccounts}
        onSelectAddress={handleSetCurrentAccount}
        // connectorConfig={connectorOptionalConfig}
        // onConnectorConfigUpdate={handleConnectorConfigUpdate}
        currentProviderName={currentProviderName}
      /> */}

      {/* {(!account || !library || !currentAccount) && (
        <ConnectWalletModal
          preferredChainId={preferredNetwork}
          onSelectPreferredChainId={handleNetworkChange}
          supportedChainIds={supportedChainIds}
          onUnlockExternalWallet={handleUnlockWallet}
          // connectorConfig={connectorOptionalConfig}
          error={formattedError}
          showLedgerBanner={showLedgerBanner}
          isVisible={isSelectWalletModalVisible || isErrorDetected}
          onBackdropPress={() => {
            setSelectWalletModalVisible(false);
            setErrorDetected(false);
          }}
        />
      )} */}

      {children}
    </UserWalletDataContext.Provider>
  );
}
