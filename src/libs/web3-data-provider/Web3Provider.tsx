import { API_ETH_MOCK_ADDRESS, transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import {
  JsonRpcProvider,
  TransactionResponse,
  // Web3Provider,
} from '@ethersproject/providers';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { useWeb3React } from '@web3-react/core';
import { TorusConnector } from '@web3-react/torus-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { BigNumber, providers } from 'ethers';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { hexToAscii } from 'src/utils/utils';
import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';

import { Web3Context } from '../hooks/useWeb3Context';
import { getWallet, ReadOnlyModeConnector, WalletType } from './WalletOptions';

export type ERC20TokenType = {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
  aToken?: boolean;
};

export type Web3Data = {
  connectWallet: (wallet: WalletType) => Promise<void>;
  connectReadOnlyMode: (address: string) => Promise<void>;
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
  switchNetworkError: Error | undefined;
  setSwitchNetworkError: (err: Error | undefined) => void;
  readOnlyModeAddress: string | undefined;
  readOnlyMode: boolean;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const {
    account,
    chainId,
    library: provider,
    activate,
    active,
    error,
    deactivate,
    setError,
  } = useWeb3React<providers.Web3Provider>();

  // const [provider, setProvider] = useState<JsonRpcProvider>();
  const [connector, setConnector] = useState<AbstractConnector>();
  const [loading, setLoading] = useState(false);
  const [tried, setTried] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const [triedGnosisSafe, setTriedGnosisSafe] = useState(false);
  const [triedCoinbase, setTriedCoinbase] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [triedLedger, setTriedLedger] = useState(false);
  const [switchNetworkError, setSwitchNetworkError] = useState<Error>();
  const setAccount = useRootStore((store) => store.setAccount);

  // for now we use network changed as it returns the chain string instead of hex
  // const handleChainChanged = (chainId: number) => {
  //   console.log('chainChanged', chainId);
  //   if (selectedWallet) {
  //     connectWallet(selectedWallet);
  //   }
  // };

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
      localStorage.removeItem('-walletlink:https://www.walletlink.org:AppVersion');
      localStorage.removeItem('-walletlink:https://www.walletlink.org:Addresses');
      localStorage.removeItem('-walletlink:https://www.walletlink.org:walletUsername');
    } else if (connector instanceof TorusConnector) {
      localStorage.removeItem('loglevel:torus.js');
      localStorage.removeItem('loglevel:torus-embed');
      localStorage.removeItem('loglevel:http-helpers');
    }
  }, [connector]);

  const disconnectWallet = useCallback(async () => {
    cleanConnectorStorage();
    localStorage.removeItem('walletProvider');
    deactivate();
    // @ts-expect-error close can be returned by wallet
    if (connector && connector.close) {
      // @ts-expect-error close can be returned by wallet
      // close will remove wallet from DOM if provided by wallet
      await connector.close();
    }

    setLoading(false);
    setDeactivated(true);
    setSwitchNetworkError(undefined);
  }, [provider, connector]);

  const connectReadOnlyMode = (address: string): Promise<void> => {
    localStorage.setItem('readOnlyModeAddress', address);
    return connectWallet(WalletType.READ_ONLY_MODE);
  };

  // connect to the wallet specified by wallet type
  const connectWallet = useCallback(
    async (wallet: WalletType) => {
      setLoading(true);
      try {
        const connector: AbstractConnector = getWallet(wallet, chainId);

        if (connector instanceof ReadOnlyModeConnector) {
          setReadOnlyMode(true);
        } else {
          setReadOnlyMode(false);
        }

        if (connector instanceof WalletConnectConnector) {
          connector.walletConnectProvider = undefined;
        }

        await activate(connector, undefined, true);
        setConnector(connector);
        setSwitchNetworkError(undefined);
        localStorage.setItem('walletProvider', wallet.toString());
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

  const activateInjectedProvider = (providerName: string | 'MetaMask' | 'CoinBase') => {
    // @ts-expect-error ethereum doesn't necessarily exist
    const { ethereum } = window;

    if (!ethereum?.providers) {
      return true;
    }

    let provider;
    switch (providerName) {
      case 'CoinBase':
        provider = ethereum.providers.find(
          //@ts-expect-error no type
          ({ isCoinbaseWallet, isCoinbaseBrowser }) => isCoinbaseWallet || isCoinbaseBrowser
        );
        break;
      case 'MetaMask':
        //@ts-expect-error no type
        provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
        break;
      default:
        return false;
    }

    if (provider) {
      ethereum.setSelectedProvider(provider);
      return true;
    }

    return false;
  };

  // third, try connecting to ledger
  useEffect(() => {
    if (!triedLedger && triedGnosisSafe && triedCoinbase) {
      // check if the DApp is hosted within Ledger iframe
      const canConnectToLedger = isLedgerDappBrowserProvider();
      if (canConnectToLedger) {
        connectWallet(WalletType.LEDGER).finally(() => setTriedLedger(true));
      } else {
        setTriedLedger(true);
      }
    }
  }, [connectWallet, triedGnosisSafe, triedCoinbase, triedLedger, setTriedLedger]);

  // second, try connecting to coinbase
  useEffect(() => {
    if (!triedCoinbase) {
      // do check if condition applies to try and connect directly to coinbase
      if (triedGnosisSafe) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const injectedProvider = (window as any)?.ethereum;
        if (injectedProvider?.isCoinbaseBrowser) {
          const canConnectToCoinbase = activateInjectedProvider('CoinBase');
          if (canConnectToCoinbase) {
            connectWallet(WalletType.INJECTED)
              .then(() => {
                setTriedCoinbase(true);
              })
              .catch(() => {
                setTriedCoinbase(true);
              });
          } else {
            // @ts-expect-error ethereum might not be in window
            const { ethereum } = window;

            if (ethereum) {
              activateInjectedProvider('CoinBase');
              ethereum.request({ method: 'eth_requestAccounts' });
            }

            setTriedCoinbase(true);
          }
        } else {
          setTriedCoinbase(true);
        }
      }
    }
  }, [connectWallet, triedGnosisSafe, setTriedCoinbase, triedCoinbase]);

  // first, try connecting to a gnosis safe
  useEffect(() => {
    if (!triedGnosisSafe) {
      const gnosisConnector = getWallet(WalletType.GNOSIS);
      // @ts-expect-error isSafeApp not in abstract connector type
      gnosisConnector.isSafeApp().then((loadedInSafe) => {
        if (loadedInSafe) {
          connectWallet(WalletType.GNOSIS)
            .then(() => {
              setTriedGnosisSafe(true);
            })
            .catch(() => {
              setTriedGnosisSafe(true);
            });
        } else {
          setTriedGnosisSafe(true);
        }
      });
    }
  }, [connectWallet, setTriedGnosisSafe, triedGnosisSafe]);

  // handle logic to eagerly connect to the injected ethereum provider,
  // if it exists and has granted access already
  useEffect(() => {
    const lastWalletProvider = localStorage.getItem('walletProvider');
    if (!active && !deactivated && triedGnosisSafe && triedCoinbase && triedLedger) {
      if (!!lastWalletProvider) {
        connectWallet(lastWalletProvider as WalletType).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
        // For now we will not eagerly connect to injected provider
        // const injected = getWallet(WalletType.INJECTED);
        // // @ts-expect-error isAuthorized not in AbstractConnector type. But method is there for
        // // injected provider
        // injected.isAuthorized().then((isAuthorized: boolean) => {
        //   if (isAuthorized) {
        //     connectWallet(WalletType.INJECTED).catch(() => {
        //       setTried(true);
        //     });
        //   } else {
        //     setTried(true);
        //   }
        // });
      }
    }
  }, [
    activate,
    setTried,
    active,
    connectWallet,
    deactivated,
    triedGnosisSafe,
    triedCoinbase,
    triedLedger,
  ]);

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

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

  // TODO: recheck that it works on all wallets
  const signTxData = async (unsignedData: string): Promise<SignatureLike> => {
    if (provider && account) {
      const signature: SignatureLike = await provider.send('eth_signTypedData_v4', [
        account,
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
        setSwitchNetworkError(undefined);
      } catch (switchError) {
        const networkInfo = getNetworkConfig(newChainId);
        if (switchError.code === 4902) {
          try {
            try {
              await provider.send('wallet_addEthereumChain', [
                {
                  chainId: `0x${newChainId.toString(16)}`,
                  chainName: networkInfo.name,
                  nativeCurrency: {
                    symbol: networkInfo.baseAssetSymbol,
                    decimals: networkInfo.baseAssetDecimals,
                  },
                  rpcUrls: [...networkInfo.publicJsonRPCUrl, networkInfo.publicJsonRPCWSUrl],
                  blockExplorerUrls: [networkInfo.explorerLink],
                },
              ]);
            } catch (error) {
              if (error.code !== 4001) {
                throw error;
              }
            }
            setSwitchNetworkError(undefined);
          } catch (addError) {
            setSwitchNetworkError(addError);
          }
        } else if (switchError.code === 4001) {
          setSwitchNetworkError(undefined);
        } else {
          setSwitchNetworkError(switchError);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injectedProvider = (window as any).ethereum;
    if (provider && account && window && injectedProvider) {
      if (address.toLowerCase() !== API_ETH_MOCK_ADDRESS.toLowerCase()) {
        await injectedProvider.request({
          method: 'wallet_watchAsset',
          params: {
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

  // inject account into zustand as long as aave itnerface is using old web3 providers
  useEffect(() => {
    setAccount(account?.toLowerCase());
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connectWallet,
          connectReadOnlyMode,
          disconnectWallet,
          provider,
          connected: active,
          loading,
          chainId: chainId || 1,
          switchNetwork,
          getTxError,
          sendTx,
          signTxData,
          currentAccount: account?.toLowerCase() || '',
          addERC20Token,
          error,
          switchNetworkError,
          setSwitchNetworkError,
          readOnlyModeAddress: readOnlyMode ? account?.toLowerCase() : undefined,
          readOnlyMode,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
