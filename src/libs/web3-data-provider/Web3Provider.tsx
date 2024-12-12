import { API_ETH_MOCK_ADDRESS, ERC20Service, transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers';
import { BigNumber, PopulatedTransaction } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { hexToAscii } from 'src/utils/utils';
import { UserRejectedRequestError } from 'viem';
import { useAccount, useConnect, useConnectorClient, useSwitchChain, useWatchAsset } from 'wagmi';

// import { isLedgerDappBrowserProvider } from 'web3-ledgerhq-frame-connector';
import { Web3Context } from '../hooks/useWeb3Context';
import { clientToSigner, useEthersProvider } from './adapters/EthersAdapter';

export type ERC20TokenType = {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
  aToken?: boolean;
};

export type Web3Data = {
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
  readOnlyModeAddress: string | undefined;
  provider: JsonRpcProvider | undefined;
};

interface ConnectWalletOpts {
  silently?: boolean;
  address?: string | null;
}

let didConnect = false;

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  // const { chainId: chainId, connector, provider, isActivating, isActive } = useWeb3React();
  const { switchChainAsync } = useSwitchChain();
  const { watchAssetAsync } = useWatchAsset();
  const { chainId, address, isConnected, isConnecting } = useAccount();
  const { data: connectorClient } = useConnectorClient({ chainId });
  const { connect, connectors } = useConnect();

  // const { sendTransaction } = useSendTransaction();
  const provider = useEthersProvider({ chainId });
  // const signer = useEthersSigner({ chainId });
  const account = address;

  const [error, setError] = useState<Error>();
  const [switchNetworkError, setSwitchNetworkError] = useState<Error>();
  const setAccount = useRootStore((store) => store.setAccount);
  const setAccountLoading = useRootStore((store) => store.setAccountLoading);
  const setWalletType = useRootStore((store) => store.setWalletType);

  useEffect(() => {
    // If running cypress tests, then we try to auto connect on app load
    // so it doesn't have to be driven through the UI.
    const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';
    if (!isCypressEnabled || didConnect) {
      return;
    }

    const injected = connectors[0];
    connect({ connector: injected });
    didConnect = true;
  });

  // const disconnectWallet = useCallback(async () => {
  //   localStorage.removeItem('walletProvider');
  //   localStorage.removeItem('readOnlyModeAddress');
  //   connector.resetState();
  //   if (connector.deactivate) {
  //     connector.deactivate();
  //   }
  //   setWalletType(undefined);
  //   setSwitchNetworkError(undefined);
  // }, [connector, setWalletType]);

  // connect to the wallet specified by wallet type
  // const connectWallet = useCallback(
  //   async (wallet: WalletType, opts?: ConnectWalletOpts) => {
  //     try {
  //       const connector: Connector = getWallet(wallet);
  //       if (wallet === WalletType.READ_ONLY_MODE && opts?.address) {
  //         localStorage.setItem('readOnlyModeAddress', opts.address);
  //       } else {
  //         localStorage.removeItem('readOnlyModeAddress');
  //       }
  //       await connector.activate(opts?.address);
  //       setSwitchNetworkError(undefined);
  //       setWalletType(wallet);
  //       localStorage.setItem('walletProvider', wallet.toString());
  //     } catch (e) {
  //       if (!opts?.silently) {
  //         console.log('error on activation', e);
  //         setError(e);
  //       }
  //       localStorage.removeItem('readOnlyModeAddress');
  //       localStorage.removeItem('walletProvider');
  //       setWalletType(undefined);
  //     }
  //   },
  //   [setWalletType]
  // );

  // handle logic to eagerly connect to the injected ethereum provider,
  // if it exists and has granted access already

  // useEffect(() => {
  //   const tryAppWalletsSilently = async () => {
  //     await connectWallet(WalletType.GNOSIS, { silently: true })
  //       .catch(async () => {
  //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //         const provider = (window as any)?.ethereum;

  //         if (provider && provider.isCoinbaseBrowser) {
  //           await connectWallet(WalletType.INJECTED);
  //         } else {
  //           // TODO check other providers? family
  //           throw new Error('No provider detected');
  //         }
  //       })
  //       .catch();
  //   };
  //   try {
  //     const lastWalletProvider = localStorage.getItem('walletProvider');
  //     const lastReadOnlyAddress = localStorage.getItem('readOnlyModeAddress');
  //     if (lastWalletProvider) {
  //       connectWallet(lastWalletProvider as WalletType, {
  //         address: lastReadOnlyAddress,
  //         silently: true,
  //       });
  //     } else {
  //       tryAppWalletsSilently();
  //     }
  //   } catch {
  //     localStorage.removeItem('walletProvider');
  //     localStorage.removeItem('readOnlyModeAddress');
  //   }
  // }, [connectWallet]);
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
    if (provider && connectorClient) {
      const { from, ...data } = txData;
      const signer = clientToSigner(connectorClient);
      if (signer) {
        const txResponse: TransactionResponse = await signer.sendTransaction({
          ...data,
          value: data.value ? BigNumber.from(data.value) : undefined,
        });
        return txResponse;
      }
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
    try {
      await switchChainAsync({ chainId: newChainId });
      setSwitchNetworkError(undefined);
    } catch (switchError) {
      if (switchError.code === UserRejectedRequestError.code) {
        setSwitchNetworkError(undefined);
      } else {
        setSwitchNetworkError(switchError);
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
    if (provider) {
      if (address.toLowerCase() !== API_ETH_MOCK_ADDRESS.toLowerCase()) {
        let tokenSymbol = symbol;
        if (!tokenSymbol) {
          const { getTokenData } = new ERC20Service(provider);
          const { symbol } = await getTokenData(address);
          tokenSymbol = symbol;
        }

        await watchAssetAsync({
          type: 'ERC20',
          options: {
            address,
            symbol: tokenSymbol,
            decimals,
            image,
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

  // useEffect(() => {
  //   setAccountLoading(isActivating);
  // }, [isActivating, setAccountLoading]);

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connected: isConnected,
          loading: isConnecting,
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
          readOnlyMode: false, // connector instanceof ReadOnly,
          provider,
          readOnlyModeAddress: undefined, //  connector instanceof ReadOnly ? account?.toLowerCase() : undefined,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
