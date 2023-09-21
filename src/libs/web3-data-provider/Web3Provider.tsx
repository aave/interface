import { transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber, PopulatedTransaction, providers } from 'ethers';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { hexToAscii } from 'src/utils/utils';
import {
  type WalletClient,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
  useWalletClient,
} from 'wagmi';

// import { WagmiConfig } from 'wagmi';
// import { createConfig } from '@wagmi/core';
// import { getDefaultConfig } from 'connectkit';
import { Web3Context } from '../hooks/useWeb3Context';
import { getWallet, ReadOnlyModeConnector, WalletType } from './WalletOptions';

export function walletClientToProvider(walletClient: WalletClient) {
  const { chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  return new providers.Web3Provider(transport, network);
}

export function walletClientToSigner(walletClient: WalletClient) {
  const { account } = walletClient;
  const provider = walletClientToProvider(walletClient);
  const signer = provider.getSigner(account.address);
  return signer;
}

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
  chainId: number;
  switchNetwork: (chainId: number) => void;
  getTxError: (txHash: string) => Promise<string>;
  sendTx: (txData: transactionType | PopulatedTransaction) => Promise<TransactionResponse>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTxData: (unsignedData: string) => Promise<SignatureLike>;
  error: Error | null;
  switchNetworkError: Error | null;
  readOnlyModeAddress: string | undefined;
  readOnlyMode: boolean;
};

export const Web3ContextProvider: React.FC<React.PropsWithChildren<{ children: ReactElement }>> = ({
  children,
}) => {
  const { data: walletClient } = useWalletClient();
  const { address: account, isConnected } = useAccount();
  const { connect, isLoading: connectLoading, error } = useConnect();
  const { disconnect, isLoading: disconnectLoading } = useDisconnect();
  const { switchNetwork: _switchNetwork, error: switchNetworkError } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [setAccount, currentChainId] = useRootStore((store) => [
    store.setAccount,
    store.currentChainId,
  ]);
  const setAccountLoading = useRootStore((store) => store.setAccountLoading);
  const setWalletType = useRootStore((store) => store.setWalletType);

  const disconnectWallet = useCallback(async () => {
    disconnect();
    setWalletType(undefined);
  }, [disconnect, setWalletType]);

  const connectReadOnlyMode = (address: string): Promise<void> => {
    localStorage.setItem('readOnlyModeAddress', address);
    return connectWallet(WalletType.READ_ONLY_MODE);
  };

  const connectWallet = useCallback(
    async (wallet: WalletType) => {
      try {
        const connector = getWallet(wallet, chain?.id, currentChainId);

        if (connector instanceof ReadOnlyModeConnector) {
          setReadOnlyMode(true);
        } else {
          setReadOnlyMode(false);
        }
        connect({ connector });
        setWalletType(wallet);
      } catch (e) {
        console.log('error on activation', e);
        setWalletType(undefined);
      }
    },
    [currentChainId, chain?.id, connect, setWalletType]
  );

  const switchNetwork = (chainId: number) => {
    if (_switchNetwork) _switchNetwork(chainId);
  };

  // Tx methods

  // TODO: we use from instead of currentAccount because of the mock wallet.
  // If we used current account then the tx could get executed
  const sendTx = async (
    txData: transactionType | PopulatedTransaction
  ): Promise<TransactionResponse> => {
    if (walletClient) {
      const { from, ...data } = txData;
      const signer = walletClientToSigner(walletClient);
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
    if (walletClient && account) {
      const provider = walletClientToProvider(walletClient);
      const signature: SignatureLike = await provider.send('eth_signTypedData_v4', [
        account,
        unsignedData,
      ]);

      return signature;
    }
    throw new Error('Error initializing permit signature');
  };

  const getTxError = async (txHash: string): Promise<string> => {
    if (walletClient) {
      const provider = walletClientToProvider(walletClient);
      const tx = await provider.getTransaction(txHash);
      // @ts-expect-error TODO: need think about "tx" type
      const code = await provider.call(tx, tx.blockNumber);
      const error = hexToAscii(code.substr(138));
      return error;
    }
    throw new Error('Error getting transaction. Provider not found');
  };

  const addERC20Token = ({
    address,
    symbol,
    decimals,
    image,
  }: ERC20TokenType): Promise<boolean> => {
    if (walletClient) {
      return walletClient.watchAsset({
        type: 'ERC20',
        options: {
          address,
          symbol,
          decimals,
          image,
        },
      });
    }
    return Promise.resolve(false);
  };

  // inject account into zustand as long as aave itnerface is using old web3 providers
  useEffect(() => {
    setAccount(account?.toLowerCase());
  }, [account]);

  useEffect(() => {
    setAccountLoading(connectLoading || disconnectLoading);
  }, [connectLoading, disconnectLoading]);

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: {
          connectWallet,
          connectReadOnlyMode,
          disconnectWallet,
          connected: isConnected,
          loading: connectLoading || disconnectLoading,
          chainId: chain?.id || 1,
          switchNetwork,
          getTxError,
          sendTx,
          signTxData,
          currentAccount: account?.toLowerCase() || '',
          addERC20Token,
          error,
          switchNetworkError,
          readOnlyModeAddress: readOnlyMode ? account?.toLowerCase() : undefined,
          readOnlyMode,
        },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
