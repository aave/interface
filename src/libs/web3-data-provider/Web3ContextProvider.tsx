import { API_ETH_MOCK_ADDRESS, transactionType } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import {
  JsonRpcProvider,
  Network,
  TransactionResponse,
  Web3Provider,
} from '@ethersproject/providers';
import { BigNumber, providers } from 'ethers';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { hexToAscii } from 'src/utils/utils';
import Web3Modal from 'web3modal';

import { Web3Context } from '../hooks/useWeb3Context';

export type ERC20TokenType = {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
};

export type Web3Data = {
  connectWallet: () => Promise<Web3Provider | undefined>;
  disconnectWallet: () => void;
  currentAccount: string;
  connected: boolean;
  provider: JsonRpcProvider | undefined;
  web3Modal: Web3Modal;
  chainId: number;
  switchNetwork: (chainId: number) => Promise<void>;
  getTxError: (txHash: string) => Promise<string>;
  sendTx: (txData: transactionType) => Promise<TransactionResponse>;
  addERC20Token: (args: ERC20TokenType) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTxData: (unsignedData: string) => Promise<SignatureLike>;
};

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [provider, setProvider] = useState<JsonRpcProvider>();
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(1);
  const [currentAccount, setCurrentAccount] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [web3Provider, setWeb3Provider] = useState(undefined as any);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>(undefined as unknown as Web3Modal);

  useEffect(() => {
    if (!web3Modal)
      import('./modalOptions').then((m) => {
        setWeb3Modal(m.getWeb3Modal());
      });
  }, [web3Modal]);

  // web 3 modal
  const connectWallet = useCallback(async () => {
    const providerInstance = await web3Modal.connect();
    setWeb3Provider(providerInstance);

    if (providerInstance.on) {
      providerInstance.on('accountsChanged', (accounts: string[]) => {
        setCurrentAccount(accounts[0].toLowerCase());
      });

      providerInstance.on('networkChanged', async () => {
        connectWallet();
      });
    }

    const ethProvider = new providers.Web3Provider(providerInstance);
    const connectedSigner = await ethProvider.getSigner();
    const connectedAddress = await connectedSigner.getAddress();

    // get network info
    const networkInfo: Network = await ethProvider.getNetwork();

    setProvider(ethProvider);
    setChainId(networkInfo.chainId);
    setCurrentAccount(connectedAddress.toLowerCase());

    setConnected(true);

    return ethProvider;
  }, [web3Modal]);

  const disconnectWallet = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setConnected(false);
    setCurrentAccount('');
    if (web3Provider) {
      if (web3Provider.close) {
        await web3Provider.close();
      } else if (web3Provider.disconnect) {
        web3Provider.disconnect();
      } else {
        console.log('provider: ', web3Provider);
      }
    }
  }, [web3Provider, web3Modal]);

  const switchNetwork = useCallback(
    async (newChainId: number) => {
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
    },
    [provider?.network.chainId]
  );

  useEffect(() => {
    if (web3Modal?.cachedProvider) connectWallet();
  }, [connectWallet, web3Modal]);

  useEffect(() => {
    const address = localStorage.getItem('mockWalletAddress');
    if (address) setCurrentAccount(address);
  }, [currentAccount]);

  // Tx methods
  const signTxData = useCallback(
    async (unsignedData: string): Promise<SignatureLike> => {
      if (provider && currentAccount) {
        const signature: SignatureLike = await provider.send('eth_signTypedData_v4', [
          currentAccount,
          unsignedData,
        ]);

        return signature;
      }
      throw new Error('Error initializing permit signature');
    },
    [provider?.network.chainId, currentAccount]
  );

  // TODO: we use from instead of currentAccount because of the mock wallet.
  // If we used current account then the tx could get executed
  const sendTx = useCallback(
    async (txData: transactionType): Promise<TransactionResponse> => {
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
    },
    [provider?.network.chainId]
  );

  const getTxError = useCallback(
    async (txHash: string): Promise<string> => {
      if (provider) {
        const tx = await provider.getTransaction(txHash);
        // @ts-expect-error TODO: need think about "tx" type
        const code = await provider.call(tx, tx.blockNumber);
        const error = hexToAscii(code.substr(138));
        return error;
      }
      throw new Error('Error getting transaction. Provider not found');
    },
    [provider?.network.chainId]
  );

  const addERC20Token = useCallback(
    async ({ address, symbol, decimals, image }: ERC20TokenType): Promise<boolean> => {
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
              },
            },
          });

          return true;
        }
      }
      return false;
    },
    [provider?.network.chainId]
  );

  const web3ProviderData = useMemo(
    () => ({
      connectWallet,
      disconnectWallet,
      provider,
      connected,
      web3Modal,
      chainId,
      switchNetwork,
      getTxError,
      sendTx,
      signTxData,
      addERC20Token,
    }),
    [
      connectWallet,
      disconnectWallet,
      provider,
      connected,
      web3Modal,
      chainId,
      switchNetwork,
      getTxError,
      sendTx,
      signTxData,
      addERC20Token,
    ]
  );

  return (
    <Web3Context.Provider
      value={{
        web3ProviderData: { ...web3ProviderData, currentAccount },
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
