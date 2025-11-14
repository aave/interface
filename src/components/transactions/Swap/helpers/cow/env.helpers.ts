import { CowEnv, setGlobalAdapter, TradingSdk } from '@cowprotocol/cow-sdk';
import { AaveCollateralSwapSdk } from '@cowprotocol/sdk-flash-loans';
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getPublicClient, getWalletClient } from 'wagmi/actions';

import { HOOK_ADAPTER_PER_TYPE } from '../../constants/cow.constants';
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
  });
};

export const getCowAdapter = async (chainId: number) => {
  const walletClient = await getWalletClient(wagmiConfig, { chainId });
  const publicClient = getPublicClient(wagmiConfig, { chainId });

  if (!publicClient || !walletClient) {
    throw new Error('Wallet not connected');
  }

  return new ViemAdapter({ provider: publicClient, walletClient });
};
