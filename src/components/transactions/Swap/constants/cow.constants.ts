import { CowEnv, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk';
import { AaveFlashLoanType } from '@cowprotocol/sdk-flash-loans';

import { getAssetGroup } from '../helpers/shared/assetCorrelation.helpers';
import { OrderType, SwapType } from '../types';

export const HOOK_ADAPTER_PER_TYPE: Record<AaveFlashLoanType, Record<SupportedChainId, string>> = {
  [AaveFlashLoanType.CollateralSwap]: {
    [SupportedChainId.MAINNET]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.GNOSIS_CHAIN]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.ARBITRUM_ONE]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.AVALANCHE]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.BNB]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.POLYGON]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.BASE]: '0x029d584E847373B6373b01dfaD1a0C9BfB916382',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.LENS]: '',
    [SupportedChainId.LINEA]: '',
    [SupportedChainId.PLASMA]: '',
  },
  [AaveFlashLoanType.DebtSwap]: {
    [SupportedChainId.MAINNET]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.GNOSIS_CHAIN]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.ARBITRUM_ONE]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.AVALANCHE]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.BNB]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.POLYGON]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.BASE]: '0x73e7aF13Ef172F13d8FEfEbfD90C7A6530096344',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.LENS]: '',
    [SupportedChainId.LINEA]: '',
    [SupportedChainId.PLASMA]: '',
  },
  [AaveFlashLoanType.RepayCollateral]: {
    [SupportedChainId.MAINNET]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.GNOSIS_CHAIN]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.ARBITRUM_ONE]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.AVALANCHE]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.BNB]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.POLYGON]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.BASE]: '0xAc27F3f86e78B14721d07C4f9CE999285f9AAa06',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.LENS]: '',
    [SupportedChainId.LINEA]: '',
    [SupportedChainId.PLASMA]: '',
  },
};

export const ADAPTER_FACTORY: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.GNOSIS_CHAIN]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.ARBITRUM_ONE]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.AVALANCHE]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.BNB]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.POLYGON]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.BASE]: '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192',
  [SupportedChainId.LENS]: '',
  [SupportedChainId.LINEA]: '',
  [SupportedChainId.PLASMA]: '',
  [SupportedChainId.SEPOLIA]: '',
};

export const DUST_PROTECTION_MULTIPLIER = 1.0003; // 3 BPS

export const COW_UNSUPPORTED_ASSETS: Partial<
  Record<SwapType | 'ALL', Partial<Record<SupportedChainId, string[] | 'ALL'>>>
> = {
  [SwapType.DebtSwap]: {
    [SupportedChainId.SEPOLIA]: 'ALL',
  },
  [SwapType.CollateralSwap]: {
    [SupportedChainId.SEPOLIA]: 'ALL',
  },
  [SwapType.RepayWithCollateral]: {
    [SupportedChainId.SEPOLIA]: 'ALL',
  },

  // Specific assets that are not supported for certain chains across all swap types
  ['ALL']: {
    [SupportedChainId.POLYGON]: [
      '0x8eb270e296023e9d92081fdf967ddd7878724424'.toLowerCase(), // aPOLGHST not supported
      '0x38d693ce1df5aadf7bc62595a37d667ad57922e5'.toLowerCase(), // aPolEURS not supported
      '0xea1132120ddcdda2f119e99fa7a27a0d036f7ac9'.toLowerCase(), // aPolSTMATIC not supported
      '0x6533afac2e7bccb20dca161449a13a32d391fb00'.toLowerCase(), // aPolJEUR not supported
      '0x513c7e3a9c69ca3e22550ef58ac1c0088e918fff'.toLowerCase(), // aPolCRV not supported
      '0xebe517846d0f36eced99c735cbf6131e1feb775d'.toLowerCase(), // aPolMIMATIC not supported
      '0xc45a479877e1e9dfe9fcd4056c699575a1045daa'.toLowerCase(), // aPolSUSHI not supported
      '0x8437d7c167dfb82ed4cb79cd44b7a32a1dd95c77'.toLowerCase(), // aPolAGEUR not supported
      '0x724dc807b04555b71ed48a6896b6f41593b8c637'.toLowerCase(), // aPolDPI not supported
      '0x8ffdf2de812095b1d19cb146e4c004587c0a0692'.toLowerCase(), // aPolBAL not supported
    ],
    [SupportedChainId.AVALANCHE]: [
      '0x8eb270e296023e9d92081fdf967ddd7878724424'.toLowerCase(), // AVaMAI not supported
      '0x078f358208685046a11c85e8ad32895ded33a249'.toLowerCase(), // aVaWBTC not supported
      '0xc45a479877e1e9dfe9fcd4056c699575a1045daa'.toLowerCase(), // aVaFRAX not supported
    ],
    [SupportedChainId.GNOSIS_CHAIN]: [
      '0xedbc7449a9b594ca4e053d9737ec5dc4cbccbfb2'.toLowerCase(), // EURe USD Price not supported
    ],
    [SupportedChainId.ARBITRUM_ONE]: [
      '0x62fC96b27a510cF4977B59FF952Dc32378Cc221d'.toLowerCase(), // atBTC does not have good solver liquidity
    ],
    [SupportedChainId.BASE]: [
      '0x90072A4aA69B5Eb74984Ab823EFC5f91e90b3a72'.toLowerCase(), // alBTC does not have good solver liquidity
    ],
    [SupportedChainId.MAINNET]: [
      '0x00907f9921424583e7ffBfEdf84F92B7B2Be4977'.toLowerCase(), // aGHO not supported
      '0x18eFE565A5373f430e2F809b97De30335B3ad96A'.toLowerCase(), // aGHO not supported
    ],
    [SupportedChainId.SEPOLIA]: [
      '0xd190eF37dB51Bb955A680fF1A85763CC72d083D4'.toLowerCase(), // aGHO not supported
    ],

    // Safe checks, not supported
    [SupportedChainId.LENS]: 'ALL',
    [SupportedChainId.LINEA]: 'ALL',
    [SupportedChainId.PLASMA]: 'ALL',
  },
};

export const CoWProtocolSupportedNetworks = [
  SupportedChainId.MAINNET,
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.BASE,
  SupportedChainId.SEPOLIA,
  SupportedChainId.AVALANCHE,
  SupportedChainId.POLYGON,
  SupportedChainId.BNB,
] as const;

export const isChainIdSupportedByCoWProtocol = (chainId: number): chainId is SupportedChainId => {
  return CoWProtocolSupportedNetworks.includes(chainId);
};

export const COW_EVM_RECIPIENT = '0xC542C2F197c4939154017c802B0583C596438380';
// export const COW_LENS_RECIPIENT = '0xce4eB8a1f6Bd0e0B9282102DC056B11E9D83b7CA';
export const COW_PROTOCOL_ETH_FLOW_ADDRESS = '0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC';
export const COW_PROTOCOL_ETH_FLOW_ADDRESS_STAGING = '0x04501b9b1D52e67f6862d157E00D13419D2D6E95';

export const COW_PROTOCOL_ETH_FLOW_ADDRESS_BY_ENV = (env: CowEnv) => {
  return env === 'staging' ? COW_PROTOCOL_ETH_FLOW_ADDRESS_STAGING : COW_PROTOCOL_ETH_FLOW_ADDRESS;
};

export const COW_CREATE_ORDER_ABI =
  'function createOrder((address,address,uint256,uint256,bytes32,uint256,uint32,bool,int64)) returns (bytes32)';

const DEFAULT_PARTNER_FEE_SAME_GROUP_BPS = 15;
const DEFAULT_PARTNER_FEE_CROSS_GROUP_BPS = 25;
const PARTNER_FEE_BPS_BY_SWAP_TYPE: Partial<Record<SwapType, number>> = {
  [SwapType.DebtSwap]: 0,
};

export const COW_PARTNER_FEE = (
  tokenFromSymbol: string,
  tokenToSymbol: string,
  swapType?: SwapType
) => {
  const swapTypeBps = swapType !== undefined ? PARTNER_FEE_BPS_BY_SWAP_TYPE[swapType] : undefined;

  const defaultBps =
    getAssetGroup(tokenFromSymbol) == getAssetGroup(tokenToSymbol)
      ? DEFAULT_PARTNER_FEE_SAME_GROUP_BPS
      : DEFAULT_PARTNER_FEE_CROSS_GROUP_BPS;

  return {
    volumeBps: swapTypeBps !== undefined ? swapTypeBps : defaultBps,
    recipient: COW_EVM_RECIPIENT,
  };
};

export const FLASH_LOAN_FEE_BPS = 5;

export const COW_APP_DATA = (
  tokenFromSymbol: string,
  tokenToSymbol: string,
  slippageBips: number,
  smartSlippage: boolean,
  orderType: OrderType,
  appCode: string,
  swapType?: SwapType,
  hooks?: Record<string, unknown>
) => ({
  appCode: appCode,
  version: '1.4.0',
  metadata: {
    orderClass: {
      orderClass: orderType === OrderType.LIMIT ? OrderClass.LIMIT : OrderClass.MARKET,
    }, // for CoW Swap UI & Analytics
    ...(orderType === OrderType.MARKET
      ? { quote: { slippageBips, smartSlippage } }
      : // Slippage is not used in limit orders
        {}),
    partnerFee: COW_PARTNER_FEE(tokenFromSymbol, tokenToSymbol, swapType),
    hooks,
  },
});

// TODO: Optimize CoW Values
export const COW_PROTOCOL_GAS_LIMITS: Record<SwapType, number> = {
  [SwapType.Swap]: 1000000, // only eth-flow and smart contract wallets
  [SwapType.CollateralSwap]: 1000000, // only if non-flashloan
  [SwapType.DebtSwap]: 0,
  [SwapType.RepayWithCollateral]: 0,
  [SwapType.WithdrawAndSwap]: 0,
};
