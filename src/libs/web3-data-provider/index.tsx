import React, { ReactElement, useCallback, useContext, useMemo, useState } from "react";
import { getNetworkConfig, getSupportedChainIds } from "../../helpers/config/markets-and-network-config";
import Web3Modal from 'web3modal';
import { providers } from "ethers";
import WalletConnect from "@walletconnect/web3-provider";
import Torus from "@toruslabs/torus-embed";
import WalletLink from "walletlink";
import ethProvider from "eth-provider";
import { JsonRpcProvider, Network, Web3Provider } from "@ethersproject/providers";

const POLLING_INTERVAL = 12000;
const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

const getProviderOptions = (networkId: number) => {

  const supportedChainIds = getSupportedChainIds();
  const networkConfig = getNetworkConfig(networkId);
  const providerOptions = {
    walletconnect: {
      package: WalletConnect,
      options: {
        rpc: supportedChainIds.reduce((acc, network) => {
          const config = getNetworkConfig(network);
          acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
          return acc;
        }, {} as { [networkId: number]: string }),
        bridge: 'https://aave.bridge.walletconnect.org',
        qrcode: true,
        pollingInterval: POLLING_INTERVAL,
      }
    },
    // torus: {
    //   package: Torus,
    // },
    walletlink: {
      package: WalletLink,
      options: {
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0]
      }
    },
    frame: {
      package: ethProvider, // required
    }
  };
  return providerOptions;
};

const addWalletsToWeb3Modal = (networkId: number): Web3Modal => {
  const web3Modal: Web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: getProviderOptions(networkId)
  });

  return web3Modal;
}

export type Web3Data = {
  connectWallet: () => Promise<Web3Provider | undefined>;
  disconnectWallet: () => void;
  // hasCachedProvider: () => boolean;
  currentAccount: string;
  connected: boolean;
  provider: JsonRpcProvider | undefined;
  web3Modal: Web3Modal;
  networkId: number;
  networkName: string;
}

export type Web3ContextData = {
  web3ProviderData: Web3Data;
};

const Web3Context = React.createContext({} as Web3ContextData);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (Object.keys(web3Context).length === 0) {
    throw new Error(
      "useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.",
    );
  }
  
  const { web3ProviderData } = web3Context;
  return useMemo<Web3Data>(() => {
    return { ...web3ProviderData };
  }, [web3Context]);
};


export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  // TODO: do we need to put default mainnet provider?
  const [provider, setProvider] = useState<JsonRpcProvider>();
  const [connected, setConnected] = useState(false);
  const [networkId, setNetworkId] = useState(1);
  const [networkName, setNetworkName] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');

  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(addWalletsToWeb3Modal(networkId));

  // provider events subscriptions
  const initSubscriptions = useCallback((providerInstance) => {
    if (!providerInstance.on) {
      return;
    }
    providerInstance.on("accountsChanged", (accounts: string[]) => {
      // TODO: should we refresh page on account change?
      setTimeout(() => window.location.reload(), 1);
      setCurrentAccount(accounts[0]);
    });

    providerInstance.on("networkChanged", async (networkId: number) => {
      const providerNetwork = await provider?.getNetwork();
      if (providerNetwork?.chainId !== networkId) {
        setTimeout(() => window.location.reload(), 1);
      } else {
        setNetworkId(networkId);
        // TODO: do we need this:
        // localStorage.setItem('preferredChainId', networkId as unknown as string);
      }
    });
  },[provider]);

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
    setNetworkId(networkInfo.chainId);
    setNetworkName(networkInfo.name); // TODO: maybe have to clean it up
    setCurrentAccount(connectedAddress);
    
    setConnected(true);
    
    return ethProvider;
  }, [provider, web3Modal, connected]);

  const disconnectWallet = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setConnected(false);

    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [provider, web3Modal, connected]);

  const web3ProviderData = useMemo(
    () => ({
      connectWallet,
      disconnectWallet,
      // hasCachedProvider,
      provider,
      connected,
      currentAccount,
      web3Modal,
      networkId,
      networkName,
    }),
    [
      connectWallet,
      disconnectWallet,
      // hasCachedProvider,
      provider,
      connected,
      currentAccount,
      web3Modal,
      networkId,
      networkName,
    ],
  );

  return <Web3Context.Provider value={{ 
    web3ProviderData
   }}>{children}</Web3Context.Provider>;
}