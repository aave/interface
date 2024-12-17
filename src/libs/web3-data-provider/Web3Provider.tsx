import { API_ETH_MOCK_ADDRESS, ERC20Service, transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers';
import { PopulatedTransaction, utils } from 'ethers';
import React, { ReactElement, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { hexToAscii } from 'src/utils/utils';
import { Hash, UserRejectedRequestError } from 'viem';
import {
  useAccount,
  useClient,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWatchAsset,
} from 'wagmi';

import { Web3Context } from '../hooks/useWeb3Context';
import { clientToProvider } from './adapters/EthersAdapter';

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
  sendTx: (txData: transactionType | PopulatedTransaction) => Promise<{ hash: Hash }>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  signTxData: (unsignedData: string) => Promise<SignatureLike>;
  switchNetworkError: Error | undefined;
  setSwitchNetworkError: (err: Error | undefined) => void;
  readOnlyMode: boolean;
  readOnlyModeAddress: string | undefined;
  provider: JsonRpcProvider | undefined;
  setReadOnlyModeAddress: (address: string | undefined) => void;
};

let didInit = false;
let didAutoConnectForCypress = false;

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { switchChainAsync } = useSwitchChain();
  const { watchAssetAsync } = useWatchAsset();
  const { chainId, address, isConnected, isConnecting } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { signTypedDataAsync } = useSignTypedData();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [readOnlyModeAddress, setReadOnlyModeAddress] = useState<string | undefined>();
  const client = useClient();

  const account = address;

  const [switchNetworkError, setSwitchNetworkError] = useState<Error>();
  const setAccount = useRootStore((store) => store.setAccount);

  const readOnlyMode = utils.isAddress(readOnlyModeAddress || '');
  let currentAccount = account?.toLowerCase() || '';
  if (readOnlyMode && readOnlyModeAddress) {
    currentAccount = readOnlyModeAddress;
  }

  useEffect(() => {
    if (didInit) {
      // If user connects a wallet after the app is loaded, then we need to reset the readOnlyModeAddress
      if (isConnected && readOnlyMode) {
        localStorage.removeItem('readOnlyModeAddress');
        setReadOnlyModeAddress(undefined);
      }

      return;
    }

    // If the app loads in readOnlyMode, then we disconnect the wallet if it auto connected
    const storedReadOnlyAddress = localStorage.getItem('readOnlyModeAddress');
    if (storedReadOnlyAddress && utils.isAddress(storedReadOnlyAddress)) {
      setReadOnlyModeAddress(storedReadOnlyAddress);
      if (isConnected) {
        disconnect();
      }
    }

    didInit = true;
  }, [disconnect, isConnected, readOnlyMode]);

  useEffect(() => {
    // If running cypress tests, then we try to auto connect on app load
    // so it doesn't have to be driven through the UI.
    const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';
    if (!isCypressEnabled || didAutoConnectForCypress) {
      return;
    }

    const injected = connectors[0];
    connect({ connector: injected });
    didAutoConnectForCypress = true;
  });

  const sendTx = async (
    txData: transactionType | PopulatedTransaction
  ): Promise<{ hash: Hash }> => {
    try {
      client?.request
      // const { from, ...data } = txData;
      const hash = await sendTransactionAsync({
        ...txData,
      });
      return { hash };
    } catch (error) {
      console.error('Error sending transaction', error);
      throw new Error('Error sending transaction');
    }
  };

  const signTxData = async (unsignedData: string): Promise<SignatureLike> => {
    try {
      const signature = await signTypedDataAsync(JSON.parse(unsignedData));
      return signature;
    } catch (error) {
      console.error('Error initializing permit signature', error);
      throw new Error('Error initializing permit signature');
    }
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
    if (!client) {
      return false;
    }

    const provider = clientToProvider(client);
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

  useEffect(() => {
    if (readOnlyModeAddress) {
      setAccount(readOnlyModeAddress);
    }
  }, [readOnlyModeAddress, setAccount]);

  // useEffect(() => {
  //   setAccountLoading(isActivating);
  // }, [isActivating, setAccountLoading]);

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connected: isConnected,
          loading: isConnecting && !isConnected,
          chainId: chainId || 1,
          switchNetwork,
          getTxError,
          sendTx,
          signTxData,
          currentAccount,
          addERC20Token,
          switchNetworkError,
          setSwitchNetworkError,
          readOnlyMode,
          provider: undefined,
          readOnlyModeAddress,
          setReadOnlyModeAddress,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
