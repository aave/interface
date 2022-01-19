import { JsonRpcProvider, Network, Web3Provider } from '@ethersproject/providers';
import { providers } from 'ethers';
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Web3Modal from 'web3modal';

export type Web3Data = {
  connectWallet: () => Promise<Web3Provider | undefined>;
  disconnectWallet: () => void;
  currentAccount: string;
  connected: boolean;
  provider: JsonRpcProvider | undefined;
  web3Modal: Web3Modal;
  chainId: number;
};

export type Web3ContextData = {
  web3ProviderData: Web3Data;
};

const Web3Context = React.createContext({} as Web3ContextData);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (Object.keys(web3Context).length === 0) {
    throw new Error(
      'useWeb3Context() can only be used inside of <Web3ContextProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  const { web3ProviderData } = web3Context;
  return useMemo<Web3Data>(() => {
    return { ...web3ProviderData };
  }, [web3Context]);
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [provider, setProvider] = useState<JsonRpcProvider>();
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(1);
  const [currentAccount, setCurrentAccount] = useState('');

  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(undefined as unknown as Web3Modal);

  useEffect(() => {
    if (web3Modal?.cachedProvider) connectWallet();
  }, [web3Modal]);

  useEffect(() => {
    import('./modalOptions').then((m) => setWeb3Modal(m.getWeb3Modal(chainId)));
  }, [chainId, currentAccount]);

  // provider events subscriptions
  const initSubscriptions = useCallback(
    (providerInstance) => {
      if (!providerInstance.on) {
        return;
      }
      providerInstance.on('accountsChanged', (accounts: string[]) => {
        setCurrentAccount(accounts[0]);
      });

      providerInstance.on('networkChanged', async (chainId: number) => {
        const providerNetwork = await provider?.getNetwork();
        if (providerNetwork?.chainId !== chainId) {
          setTimeout(() => window.location.reload(), 1);
        } else {
          setChainId(chainId);
        }
      });
    },
    [provider]
  );

  // web 3 modal
  const connectWallet = useCallback(async () => {
    const providerInstance = await web3Modal.connect();
    await initSubscriptions(providerInstance);

    const ethProvider = new providers.Web3Provider(providerInstance);
    const connectedSigner = await ethProvider.getSigner();
    const connectedAddress = await connectedSigner.getAddress();

    // get network info
    const networkInfo: Network = await ethProvider.getNetwork();

    setProvider(ethProvider);
    setChainId(networkInfo.chainId);
    setCurrentAccount(connectedAddress);

    setConnected(true);

    return ethProvider;
  }, [provider, web3Modal, connected]);

  const disconnectWallet = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setConnected(false);
    setCurrentAccount('');
  }, [provider, web3Modal, connected]);

  const web3ProviderData = useMemo(
    () => ({
      connectWallet,
      disconnectWallet,
      provider,
      connected,
      currentAccount,
      web3Modal,
      chainId,
    }),
    [connectWallet, disconnectWallet, provider, connected, currentAccount, web3Modal, chainId]
  );

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
