import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk';

import { getAssetGroup } from '../helpers/shared/assetCorrelation.helpers';
import { OrderType, SwapType } from '../types';

export const COW_UNSUPPORTED_ASSETS: Partial<
  Record<SwapType, Partial<Record<SupportedChainId, string[] | 'ALL'>>>
> = {
  [SwapType.CollateralSwap]: {
    [SupportedChainId.POLYGON]: 'ALL', // Polygon not supported for collateral swap, waiting better solvers support
    [SupportedChainId.AVALANCHE]: 'ALL', // Disabled until we have better solvers liquidity
    [SupportedChainId.BNB]: 'ALL', // Disabled until we have better solvers liquidity
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
  },
  [SwapType.DebtSwap]: {
    [SupportedChainId.MAINNET]: 'ALL',
    [SupportedChainId.ARBITRUM_ONE]: 'ALL',
    [SupportedChainId.BASE]: 'ALL',
    [SupportedChainId.SEPOLIA]: 'ALL',
    [SupportedChainId.AVALANCHE]: 'ALL',
    [SupportedChainId.POLYGON]: 'ALL',
    [SupportedChainId.BNB]: 'ALL',
  },
  [SwapType.RepayWithCollateral]: {
    [SupportedChainId.MAINNET]: 'ALL',
    [SupportedChainId.ARBITRUM_ONE]: 'ALL',
    [SupportedChainId.BASE]: 'ALL',
    [SupportedChainId.SEPOLIA]: 'ALL',
    [SupportedChainId.AVALANCHE]: 'ALL',
    [SupportedChainId.POLYGON]: 'ALL',
    [SupportedChainId.BNB]: 'ALL',
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
export const COW_CREATE_ORDER_ABI =
  'function createOrder((address,address,uint256,uint256,bytes32,uint256,uint32,bool,int64)) returns (bytes32)';

export const HEADER_WIDGET_APP_CODE = 'aave-v3-interface-widget';
export const ADAPTER_APP_CODE = 'aave-v3-interface-aps'; // Use this one for contract adapters so we have different dashboards
export const COW_PARTNER_FEE = (tokenFromSymbol: string, tokenToSymbol: string) => ({
  volumeBps: getAssetGroup(tokenFromSymbol) == getAssetGroup(tokenToSymbol) ? 15 : 25,
  recipient: COW_EVM_RECIPIENT,
});

export const FLASH_LOAN_FEE_BPS = 5;
export const VALID_TO_HALF_HOUR = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes

export const COW_APP_DATA = (
  tokenFromSymbol: string,
  tokenToSymbol: string,
  slippageBips: number,
  smartSlippage: boolean,
  orderType: OrderType,
  appCode: string,
  hooks?: Record<string, unknown>
) => ({
  appCode: appCode,
  version: '1.4.0',
  metadata: {
    orderClass: {
      orderClass: orderType === OrderType.LIMIT ? OrderClass.LIMIT : OrderClass.MARKET,
    }, // for CoW Swap UI & Analytics
    quote: {
      slippageBips,
      smartSlippage,
    },
    partnerFee: COW_PARTNER_FEE(tokenFromSymbol, tokenToSymbol),
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
