import { API_ETH_MOCK_ADDRESS, ERC20Service, transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import {
  TransactionResponse,
  // Web3Provider,
} from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { Connector } from '@web3-react/types';
import { BigNumber, PopulatedTransaction } from 'ethers';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { hexToAscii } from 'src/utils/utils';

// import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';
import { Web3Context } from '../hooks/useWeb3Context';
import { ReadOnlyConnector } from './connectors/ReadOnlyConnector';
import { getWallet, WalletType } from './WalletOptions';

export type ERC20TokenType = {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
  aToken?: boolean;
};

export type Web3Data = {
  connectWallet: (wallet: WalletType, address?: string) => Promise<void>;
  disconnectWallet: () => void;
  currentAccount: string;
  connected: boolean;
  loading: boolean;
  chainId: number;
  switchNetwork: (chainId: number) => Promise<void>;
  getTxError: (txHash: string) => Promise<string>;
  sendTx: (txData: transactionType | PopulatedTransaction) => Promise<TransactionResponse>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  signTxData: (unsignedData: string) => Promise<SignatureLike>;
  error: Error | undefined;
  switchNetworkError: Error | undefined;
  setSwitchNetworkError: (err: Error | undefined) => void;
  readOnlyMode: boolean;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { account, chainId, connector, provider, isActivating, isActive } = useWeb3React();

  const [error, setError] = useState<Error>();
  const [switchNetworkError, setSwitchNetworkError] = useState<Error>();
  const setAccount = useRootStore((store) => store.setAccount);
  const setAccountLoading = useRootStore((store) => store.setAccountLoading);
  const setWalletType = useRootStore((store) => store.setWalletType);

  const disconnectWallet = useCallback(async () => {
    localStorage.removeItem('walletProvider');
    localStorage.removeItem('readOnlyModeAddress');
    connector.resetState();
    if (connector.deactivate) {
      connector.deactivate();
    }
    setWalletType(undefined);
    setSwitchNetworkError(undefined);
  }, [connector, setWalletType]);

  // connect to the wallet specified by wallet type
  const connectWallet = useCallback(
    async (wallet: WalletType, address?: string) => {
      try {
        const connector: Connector = getWallet(wallet);
        await connector.activate(address);
        if (wallet === WalletType.READ_ONLY_MODE && address) {
          localStorage.setItem('readOnlyModeAddress', address);
        } else {
          localStorage.removeItem('readOnlyModeAddress');
        }
        setSwitchNetworkError(undefined);
        setWalletType(wallet);
        localStorage.setItem('walletProvider', wallet.toString());
      } catch (e) {
        console.log('error on activation', e);
        setError(e);
        localStorage.removeItem('readOnlyModeAddress');
        localStorage.removeItem('walletProvider');
        setWalletType(undefined);
      }
    },
    [setWalletType]
  );

  /*
  const activateMetaMask = async (connector: AbstractConnector) => {
    // This is a workaround for an issue that happens with chrome and metamask.
    // If the app was preloaded in chrome, there's a case where the extension can be
    // unresponsive if the app was switched from preloading to active at the wrong time.
    // This produces an infinite loading spinner on app load.
    // There are no errors thrown that we can handle in this state, so just retry activating
    // the connector. If it still fails after the backoff retry, then throw an error.
    // See this issue for more details: https://github.com/MetaMask/metamask-extension/issues/23329

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unlocked = (await (window as any)?.ethereum?._metamask?.isUnlocked()) ?? false;
    if (!unlocked) {
      // if the extension is locked, just do the normal activation
      return activate(connector, undefined, true);
    }

    const activatePromise = activate(connector, undefined, true);

    const activateRetryAttempts = 2;

    const activateFn = async (connector: AbstractConnector, attempt: number) => {
      await Promise.race([
        activate(connector, undefined, true),
        new Promise((_resolve, reject) => {
          setTimeout(() => {
            reject(new Error('MetaMask activation timeout'));
          }, 2000);
        }),
      ]).catch((reason: unknown) => {
        console.error(reason);
        if (reason instanceof Error && reason.message === 'MetaMask activation timeout') {
          if (attempt <= activateRetryAttempts) {
            return activateFn(connector, attempt + 1);
          }
          throw reason;
        }
        // If the promise was rejected with a different error, then return the original instance.
        // This handles cases where we are waiting for user input, such as giving the dapp permissions.
        return activatePromise;
      });
    };

    await activateFn(connector, 1);
  };

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
  */

  /*
  // third, try connecting to ledger
  useEffect(() => {
    if (!triedLedger && triedGnosisSafe && triedCoinbase) {
      // check if the DApp is hosted within Ledger iframe
      // const canConnectToLedger = isLedgerDappBrowserProvider();
      if (false) {
        // TODO check if we want to support
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

  */

  // handle logic to eagerly connect to the injected ethereum provider,
  // if it exists and has granted access already

  useEffect(() => {
    const tryAppWalletsSilently = async () => {
      await connectWallet(WalletType.GNOSIS)
        .catch(async () => {
          const provider = window.ethereum;
          if (provider && provider.isCoinbaseBrowser) {
            await connectWallet(WalletType.INJECTED);
          } else {
            throw new Error('No provider detected');
          }
        })
        .catch();
    };
    try {
      const lastWalletProvider = localStorage.getItem('walletProvider');
      if (lastWalletProvider) {
        connectWallet(lastWalletProvider as WalletType);
      } else {
        tryAppWalletsSilently();
      }
    } catch {
      localStorage.removeItem('walletProvider');
      localStorage.removeItem('readOnlyModeAddress');
    }
  }, [connectWallet, disconnectWallet]);
  /*
  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  */

  // Tx methods

  // TODO: we use from instead of currentAccount because of the mock wallet.
  // If we used current account then the tx could get executed
  const sendTx = async (
    txData: transactionType | PopulatedTransaction
  ): Promise<TransactionResponse> => {
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
        let tokenSymbol = symbol;
        if (!tokenSymbol) {
          const { getTokenData } = new ERC20Service(provider);
          const { symbol } = await getTokenData(address);
          tokenSymbol = symbol;
        }

        await injectedProvider.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address,
              symbol: tokenSymbol,
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
  }, [account, setAccount]);

  useEffect(() => {
    setAccountLoading(isActivating);
  }, [isActivating, setAccountLoading]);

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connectWallet,
          disconnectWallet,
          connected: isActive,
          loading: isActivating,
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
          readOnlyMode: connector instanceof ReadOnlyConnector,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
