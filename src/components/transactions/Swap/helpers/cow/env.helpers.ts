import { CowEnv, setGlobalAdapter, TradingSdk } from '@cowprotocol/cow-sdk';
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter';
import { AaveCollateralSwapSdk } from '@cowprotocol/sdk-flash-loans';
import { ethers } from 'ethers';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { getWalletClient } from 'wagmi/actions';

import { ADAPTER_FACTORY, HOOK_ADAPTER_PER_TYPE } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { SwapState } from '../../types';
import { COW_ENV } from './orders.helpers';

export const getCowTradingSdk = async (state: SwapState, env: CowEnv = 'prod') => {
  return getCowTradingSdkByChainIdAndAppCode(
    state.chainId,
    APP_CODE_PER_SWAP_TYPE[state.swapType],
    env
  );
};

export const getCowTradingSdkByChainIdAndAppCode = async (
  chainId: number,
  appCode: string,
  env: CowEnv = COW_ENV
) => {
  const adapter = await getCowAdapter(chainId);
  return new TradingSdk(
    {
      chainId,
      appCode,
      env,
      signer: adapter.signer,
    },
    {},
    adapter
  );
};

export const getCowFlashLoanSdk = async (chainId: number) => {
  setGlobalAdapter(await getCowAdapter(chainId));
  return new AaveCollateralSwapSdk({
    hookAdapterPerType: HOOK_ADAPTER_PER_TYPE,
    aaveAdapterFactory: ADAPTER_FACTORY,
    hooksGasLimit: {
      pre: BigInt(300000),
      post: BigInt(700000),
    },
  });
};

export const getCowAdapter = async (chainId: number) => {
  const walletClient = await getWalletClient(wagmiConfig, { chainId });
  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  const eip1193Provider =
    walletClient.transport?.value || (typeof window !== 'undefined' ? window.ethereum : undefined);

  if (!eip1193Provider) {
    throw new Error('No EIP-1193 provider available for signer');
  }

  const web3Provider = new ethers.providers.Web3Provider(eip1193Provider, 'any');
  const signer = web3Provider.getSigner();

  const provider = getProvider(chainId); // Use RPC proxy

  return new EthersV5Adapter({
    provider,
    signer,
  });
};
