import { CowEnv, setGlobalAdapter, TradingSdk } from '@cowprotocol/cow-sdk';
import { AaveCollateralSwapSdk } from '@cowprotocol/sdk-flash-loans';
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getPublicClient, getWalletClient } from 'wagmi/actions';

import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { SwapState } from '../../types';

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
  env: CowEnv = 'prod'
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
  return new AaveCollateralSwapSdk();
};

export const getCowAdapter = async (chainId: number) => {
  const walletClient = await getWalletClient(wagmiConfig, { chainId });
  const publicClient = getPublicClient(wagmiConfig, { chainId });

  if (!publicClient || !walletClient) {
    throw new Error('Wallet not connected');
  }

  return new ViemAdapter({ provider: publicClient, walletClient });
};
