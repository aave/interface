import React, { ReactElement, useCallback, useEffect, useState } from 'react';

import { hexToAscii } from 'src/utils/utils';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { Web3Context } from '../hooks/useWeb3Context';
import { getWallet, WalletType } from './WalletOptions';
import { AbstractConnector } from '@web3-react/abstract-connector';
import {
  JsonRpcProvider,
  Network,
  TransactionResponse,
  // Web3Provider,
} from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { SignatureLike } from '@ethersproject/bytes';
import { API_ETH_MOCK_ADDRESS, transactionType } from '@aave/contract-helpers';
import { ERC20TokenType } from './Web3ContextProvider';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { TorusConnector } from '@web3-react/torus-connector';

export type Web3Data = {
  connectWallet: (wallet: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  currentAccount: string;
  connected: boolean;
  loading: boolean;
  provider: JsonRpcProvider | undefined;
  chainId: number;
  switchNetwork: (chainId: number) => Promise<void>;
  getTxError: (txHash: string) => Promise<string>;
  sendTx: (txData: transactionType) => Promise<TransactionResponse>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTxData: (unsignedData: string) => Promise<SignatureLike>;
  error: Error | undefined;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const {
    library: provider,
    account,
    activate,
    active,
    error,
    deactivate,
    setError,
  } = useWeb3React<ethers.providers.Web3Provider>();

  // const [provider, setProvider] = useState<JsonRpcProvider>();
  const [connector, setConnector] = useState<AbstractConnector>();
  const [chainId, setChainId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [tried, setTried] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>();

  // listener handlers
  const handleAccountsChanged = (accounts: string[]) => {
    console.log('accountsChanged', accounts);
    if (accounts.length > 0 && selectedWallet) {
      connectWallet(selectedWallet);
    }
  };
  const handleChainChanged = (chainId: number) => {
    console.log('chainChanged', chainId);
    if (selectedWallet) {
      connectWallet(selectedWallet);
    }
  };

  const handleNetworkChanged = (networkId: string) => {
    console.log('Network changed: ', networkId);
    if (selectedWallet) {
      connectWallet(selectedWallet);
    }
  };

  // Wallet connection and disconnection
  // clean local storage
  const cleanConnectorStorage = useCallback((): void => {
    if (connector instanceof WalletConnectConnector) {
      localStorage.removeItem('walletconnect');
    } else if (connector instanceof WalletLinkConnector) {
      localStorage.removeItem('-walletlink:https://www.walletlink.org:version');
      localStorage.removeItem('-walletlink:https://www.walletlink.org:session:id');
      localStorage.removeItem('-walletlink:https://www.walletlink.org:session:secret');
      localStorage.removeItem('-walletlink:https://www.walletlink.org:session:linked');
    } else if (connector instanceof TorusConnector) {
      localStorage.removeItem('loglevel:torus.js');
      localStorage.removeItem('loglevel:torus-embed');
      localStorage.removeItem('loglevel:http-helpers');
    }
  }, [connector]);

  const disconnectWallet = useCallback(async () => {
    deactivate();
    // @ts-expect-error close can be returned by wallet
    if (connector && connector.close) {
      // @ts-expect-error close can be returned by wallet
      // close will remove wallet from DOM if provided by wallet
      await connector.close();
    }

    setSelectedWallet(undefined);
    setLoading(false);
    setDeactivated(true);
    setCurrentAccount('');
    cleanConnectorStorage();
  }, [provider, connector]);

  // connect to the wallet specified by wallet type
  const connectWallet = useCallback(
    async (wallet: WalletType) => {
      setLoading(true);
      try {
        const connector: AbstractConnector = getWallet(wallet, chainId);

        if (connector instanceof WalletConnectConnector) {
          connector.walletConnectProvider = undefined;
        }

        await activate(connector, undefined, true);
        setConnector(connector);
        setSelectedWallet(wallet);

        // connector.on('chainChanged', handleChainChanged);
        connector.on('accountsChanged', handleAccountsChanged);

        // TODO: take a look why this doesnt work fro frame
        connector.on('networkChanged', handleNetworkChanged);

        const address = await connector.getAccount();
        setCurrentAccount(address?.toLowerCase() || '');
        const connectorChainId = await connector.getChainId();
        setChainId(Number(connectorChainId));
        // TODO: add listeners to account changed and chain changed
        setDeactivated(false);
        setLoading(false);
      } catch (e) {
        console.log('error on activation', e);
        setError(e);
        // disconnectWallet();
        setLoading(false);
      }
    },
    [disconnectWallet]
  );

  // handle logic to eagerly connect to the injected ethereum provider,
  // if it exists and has granted access already
  useEffect(() => {
    if (!active && !deactivated) {
      const injected = getWallet(WalletType.INJECTED);
      // @ts-expect-error isAuthorized not in AbstractConnector type. But method is there for
      // injected provider
      injected.isAuthorized().then((isAuthorized: boolean) => {
        if (isAuthorized) {
          connectWallet(WalletType.INJECTED).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      });
    }
  }, [activate, setTried, active, connectWallet, deactivated]);

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  // handle logic to connect in reaction to certain events on
  // the injected ethereum provider, if it exists
  // useEffect(() => {
  //   const { ethereum } = window;
  //   if (ethereum && ethereum.on && !active && !error && (!tried || !!loading)) {
  //     // const handleChainChanged = (chainId: number) => {
  //     //   console.log('chainChanged', chainId);
  //     //   connectWallet(WalletType.INJECTED);
  //     // };

  //     // const handleAccountsChanged = (accounts: string[]) => {
  //     //   console.log('accountsChanged', accounts);
  //     //   if (accounts.length > 0) {
  //     //     connectWallet(WalletType.INJECTED);
  //     //   }
  //     // };

  //     ethereum.on('chainChanged', handleChainChanged);
  //     ethereum.on('accountsChanged', handleAccountsChanged);

  //     return () => {
  //       if (ethereum.removeListener) {
  //         ethereum.removeListener('chainChanged', handleChainChanged);
  //         ethereum.removeListener('accountsChanged', handleAccountsChanged);
  //       }
  //     };
  //   }

  //   return undefined;
  // }, [active, error, activate, connectWallet, loading, tried]);

  useEffect(() => {
    const address = localStorage.getItem('mockWalletAddress');
    if (address) {
      setCurrentAccount(address);
    } else {
      setCurrentAccount(account?.toLowerCase() || '');
    }
  }, [account]);

  useEffect(() => {
    if (provider) {
      provider.getNetwork().then((networkInfo: Network) => {
        setChainId(networkInfo.chainId);
      });
    }
  }, [provider]);

  // Tx methods

  // TODO: we use from instead of currentAccount because of the mock wallet.
  // If we used current account then the tx could get executed
  const sendTx = async (txData: transactionType): Promise<TransactionResponse> => {
    if (provider) {
      const { from, ...data } = txData;
      const signer = provider.getSigner(from);
      const txResponse: TransactionResponse = await signer.sendTransaction({
        ...data,
        value: data.value ? BigNumber.from(data.value) : undefined,
      });
      return txResponse;
    }
    throw new Error('Error sending transaction. Provider not found');
  };

  const signTxData = async (unsignedData: string): Promise<SignatureLike> => {
    if (provider && currentAccount) {
      const signature: SignatureLike = await provider.send('eth_signTypedData_v4', [
        currentAccount,
        unsignedData,
      ]);

      return signature;
    }
    throw new Error('Error initializing permit signature');
  };

  const switchNetwork = async (newChainId: number) => {
    if (provider) {
      try {
        await provider.send('wallet_switchEthereumChain', [
          { chainId: `0x${newChainId.toString(16)}` },
        ]);
      } catch (switchError) {
        console.log(switchError);
        const networkInfo = getNetworkConfig(newChainId);
        if (switchError.code === 4902) {
          try {
            await provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${newChainId.toString(16)}`,
                chainName: networkInfo.name,
                nativeCurrency: networkInfo.baseAssetSymbol,
                rpcUrls: [...networkInfo.publicJsonRPCUrl, networkInfo.publicJsonRPCWSUrl],
                blockExplorerUrls: networkInfo.explorerLink,
              },
            ]);
          } catch (addError) {
            console.log(addError);
            // TODO: handle error somehow
          }
        }
      }
    }
  };

  const getTxError = async (txHash: string): Promise<string> => {
    if (provider) {
      const tx = await provider.getTransaction(txHash);
      // @ts-expect-error TODO: need think about "tx" type
      const code = await provider.call(tx, tx.blockNumber);
      const error = hexToAscii(code.substr(138));
      return error;
    }
    throw new Error('Error getting transaction. Provider not found');
  };

  const addERC20Token = async ({
    address,
    symbol,
    decimals,
    image,
  }: ERC20TokenType): Promise<boolean> => {
    // using window.ethereum as looks like its only supported for metamask
    // and didn't manage to make the call with ethersjs
    if (provider && currentAccount && window && window.ethereum) {
      if (address.toLowerCase() !== API_ETH_MOCK_ADDRESS.toLowerCase()) {
        await window?.ethereum?.request({
          method: 'wallet_watchAsset',
          params: {
            // @ts-expect-error needed
            type: 'ERC20',
            options: {
              address,
              symbol,
              decimals,
              image,
            },
          },
        });

        return true;
      }
    }
    return false;
  };

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connectWallet,
          disconnectWallet,
          provider,
          connected: active,
          loading,
          chainId,
          switchNetwork,
          getTxError,
          sendTx,
          signTxData,
          currentAccount,
          addERC20Token,
          error,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
