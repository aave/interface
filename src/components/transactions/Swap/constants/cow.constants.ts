import { CowEnv, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk';
import { AaveFlashLoanType } from '@cowprotocol/sdk-flash-loans';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';

import { getAssetGroup } from '../helpers/shared/assetCorrelation.helpers';
import { OrderType, SwapType } from '../types';

export const HOOK_ADAPTER_PER_TYPE: Record<AaveFlashLoanType, Record<SupportedChainId, string>> = {
  [AaveFlashLoanType.CollateralSwap]: {
    [SupportedChainId.MAINNET]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.GNOSIS_CHAIN]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.ARBITRUM_ONE]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.AVALANCHE]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.BNB]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.POLYGON]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.BASE]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.LINEA]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.PLASMA]: '0xa1138627412212e53C208e220696f14b0185a82c',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.INK]: '',
    [SupportedChainId.SOLANA]: '',
  },
  [AaveFlashLoanType.DebtSwap]: {
    [SupportedChainId.MAINNET]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.GNOSIS_CHAIN]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.ARBITRUM_ONE]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.AVALANCHE]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.BNB]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.POLYGON]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.BASE]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.LINEA]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.PLASMA]: '0xC898f87b572018ED25F501FFD620894a32dCa1AC',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.INK]: '',
    [SupportedChainId.SOLANA]: '',
  },
  [AaveFlashLoanType.RepayCollateral]: {
    [SupportedChainId.MAINNET]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.GNOSIS_CHAIN]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.ARBITRUM_ONE]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.AVALANCHE]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.BNB]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.POLYGON]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.BASE]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.LINEA]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.PLASMA]: '0x4AE46995af9ED4f4EdFC6FF1523b114EE4D7053a',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.INK]: '',
    [SupportedChainId.SOLANA]: '',
  },
  [AaveFlashLoanType.Leverage]: {
    [SupportedChainId.MAINNET]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.GNOSIS_CHAIN]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.ARBITRUM_ONE]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.AVALANCHE]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.BNB]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.POLYGON]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.BASE]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.LINEA]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.PLASMA]: '0xaEE8B0666BF8a584e9D67bFaa65007E74c70b26a',
    [SupportedChainId.SEPOLIA]: '',
    [SupportedChainId.INK]: '',
    [SupportedChainId.SOLANA]: '',
  },
};

export const ADAPTER_FACTORY: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.GNOSIS_CHAIN]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.ARBITRUM_ONE]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.AVALANCHE]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.BNB]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.POLYGON]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.BASE]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.LINEA]: '0x3171FC716942a40DEDe8dD0B7885dd9f44eca176',
  [SupportedChainId.PLASMA]: '0xD2CC30cB0e77B80a34b879ccB6da67799e4ecD83',
  [SupportedChainId.SEPOLIA]: '',
  [SupportedChainId.INK]: '',
  [SupportedChainId.SOLANA]: '',
};

// Orders saved before the factory was recorded per order were all placed through this one.
export const LEGACY_ADAPTER_FACTORY = '0xdeCC46a4b09162F5369c5C80383AAa9159bCf192';

// EIP-712 domain name the factories above verify adapter order signatures against.
export const ADAPTER_FACTORY_DOMAIN_NAME = 'AaveV3AdapterV3Factory';

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
  SupportedChainId.LINEA,
  SupportedChainId.PLASMA,
  SupportedChainId.INK,
] as const;

export const isChainIdSupportedByCoWProtocol = (chainId: number): chainId is SupportedChainId => {
  return CoWProtocolSupportedNetworks.includes(chainId);
};

export const COW_EVM_RECIPIENT = '0xC542C2F197c4939154017c802B0583C596438380';
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

const getPartnerFeeRecipient = (market: CustomMarket): string => {
  const collector = marketsData[market]?.addresses?.COLLECTOR;
  return collector || COW_EVM_RECIPIENT;
};

export const COW_PARTNER_FEE = (
  tokenFromSymbol: string,
  tokenToSymbol: string,
  swapType: SwapType,
  market: CustomMarket
) => {
  const swapTypeBps = swapType !== undefined ? PARTNER_FEE_BPS_BY_SWAP_TYPE[swapType] : undefined;

  const defaultBps =
    getAssetGroup(tokenFromSymbol) == getAssetGroup(tokenToSymbol)
      ? DEFAULT_PARTNER_FEE_SAME_GROUP_BPS
      : DEFAULT_PARTNER_FEE_CROSS_GROUP_BPS;

  return {
    volumeBps: swapTypeBps !== undefined ? swapTypeBps : defaultBps,
    recipient: getPartnerFeeRecipient(market),
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
  swapType: SwapType,
  market: CustomMarket,
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
    partnerFee: COW_PARTNER_FEE(tokenFromSymbol, tokenToSymbol, swapType, market),
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
  // Flash-loan flow: gas comes from the hook limits, not from here.
  [SwapType.Leverage]: 0,
};
