import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { MetadataApi } from '@cowprotocol/app-data';
import {
  BuyTokenDestination,
  MAX_VALID_TO_EPOCH,
  OrderBookApi,
  OrderKind,
  OrderParameters,
  OrderStatus,
  SellTokenSource,
  SigningScheme,
  SupportedChainId,
  TradingSdk,
  UnsignedOrder,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers, PopulatedTransaction } from 'ethers';
import { isSmartContractWallet } from 'src/helpers/provider';

import { isChainIdSupportedByCoWProtocol } from '../switch.constants';

export const COW_EVM_RECIPIENT = '0xC542C2F197c4939154017c802B0583C596438380';
// export const COW_LENS_RECIPIENT = '0xce4eB8a1f6Bd0e0B9282102DC056B11E9D83b7CA';
export const COW_PROTOCOL_ETH_FLOW_ADDRESS = '0xbA3cB449bD2B4ADddBc894D8697F5170800EAdeC';
const COW_CREATE_ORDER_ABI =
  'function createOrder((address,address,uint256,uint256,bytes32,uint256,uint32,bool,int64)) returns (bytes32)';

// Until CoW shares a more sophisticated way to recognize token groups, we'll maintain a lists with popular tokens
// Set all tokens to uppercase to avoid case sensitivity issues
const TOKEN_GROUPS: Record<'stable' | 'correlatedEth' | 'correlatedBtc', string[]> = {
  stable: [
    'USDC',
    'USDT',
    'DAI',
    'GHO',
    'EURC',
    'USDBC',
    'USDE',
    'USDS',
    'SUSDE',
    'RLUSD',
    'PYUSD',
    'LUSD',
    'SDAI',
    'CRVUSD',
    'USD₮0',
    'USDC.E',
    'EURE',
    'XDAI',
    'WXDAI',
  ],
  correlatedEth: [
    'WEETH',
    'ETH',
    'WETH',
    'WSTETH',
    'CBETH',
    'EZETH',
    'WRSETH',
    'OSETH',
    'RETH',
    'ETHX',
  ],
  correlatedBtc: ['CBBTC', 'WBTC', 'LBTC', 'TBTC', 'EBTC'],
} as const;

const cowSymbolGroup = (symbol: string): keyof typeof TOKEN_GROUPS | 'unknown' => {
  for (const [groupName, tokens] of Object.entries(TOKEN_GROUPS)) {
    // Allow for prefix matching e.g. aTokens
    if (tokens.some((token) => symbol.toUpperCase().endsWith(token))) {
      return groupName as keyof typeof TOKEN_GROUPS;
    }
  }
  return 'unknown';
};

export const HEADER_WIDGET_APP_CODE = 'aave-v3-interface-widget';
export const ADAPTER_APP_CODE = 'aave-v3-interface-aps'; // Use this one for contract adapters so we have different dashboards
export const COW_PARTNER_FEE = (tokenFromSymbol: string, tokenToSymbol: string) => ({
  volumeBps: cowSymbolGroup(tokenFromSymbol) == cowSymbolGroup(tokenToSymbol) ? 15 : 25,
  recipient: COW_EVM_RECIPIENT,
});
export const COW_APP_DATA = (
  tokenFromSymbol: string,
  tokenToSymbol: string,
  slippageBips?: number,
  smartSlippage?: boolean,
  appCode?: string
) => ({
  appCode: appCode || HEADER_WIDGET_APP_CODE, // todo: use ADAPTER_APP_CODE for contract adapters
  version: '1.4.0',
  metadata: {
    orderClass: { orderClass: 'market' as const }, // for CoW Swap UI & Analytics
    quote:
      slippageBips !== undefined && smartSlippage !== undefined
        ? {
            // for Analytics
            slippageBips,
            smartSlippage,
          }
        : undefined,
    partnerFee: COW_PARTNER_FEE(tokenFromSymbol, tokenToSymbol),
  },
});

export type CowProtocolActionParams = {
  quote: OrderParameters;
  provider: JsonRpcProvider;
  chainId: number;
  user: string;
  amount: string;
  tokenDest: string;
  tokenSrc: string;
  tokenSrcDecimals: number;
  tokenDestDecimals: number;
  inputSymbol: string;
  outputSymbol: string;
  afterNetworkCostsBuyAmount: string;
  slippageBps: number;
  smartSlippage: boolean;
  appCode?: string;
  feeAmount?: number;
};

export const getPreSignTransaction = async ({
  provider,
  tokenDest,
  chainId,
  user,
  amount,
  tokenSrc,
  tokenSrcDecimals,
  tokenDestDecimals,
  afterNetworkCostsBuyAmount,
  slippageBps,
  smartSlippage,
  inputSymbol,
  outputSymbol,
  appCode,
  feeAmount,
}: CowProtocolActionParams) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) {
    throw new Error('Chain not supported.');
  }

  const signer = provider?.getSigner();
  if (!signer) {
    throw new Error('No signer found in provider');
  }

  const tradingSdk = new TradingSdk({ chainId, signer, appCode: HEADER_WIDGET_APP_CODE });

  const isSmartContract = await isSmartContractWallet(user, provider);
  if (!isSmartContract) {
    throw new Error('Only smart contract wallets should use presign.');
  }

  const orderResult = await tradingSdk.postLimitOrder(
    {
      owner: user as `0x${string}`,
      sellAmount: amount,
      buyAmount: afterNetworkCostsBuyAmount,
      kind: OrderKind.SELL,
      sellToken: tokenSrc,
      buyToken: tokenDest,
      slippageBps,
      sellTokenDecimals: tokenSrcDecimals,
      buyTokenDecimals: tokenDestDecimals,
    },
    {
      appData: COW_APP_DATA(inputSymbol, outputSymbol, slippageBps, smartSlippage, appCode),
      additionalParams: {
        signingScheme: SigningScheme.PRESIGN,
        networkCostsAmount: feeAmount?.toString(),
      },
    }
  );

  const preSignTransaction = await tradingSdk.getPreSignTransaction({
    orderId: orderResult.orderId,
    account: user as `0x${string}`,
  });

  return {
    ...preSignTransaction,
    orderId: orderResult.orderId,
  };
};

// Only for EOA wallets
export const sendOrder = async ({
  provider,
  tokenDest,
  chainId,
  user,
  amount,
  tokenSrc,
  tokenSrcDecimals,
  tokenDestDecimals,
  afterNetworkCostsBuyAmount,
  slippageBps,
  inputSymbol,
  outputSymbol,
  smartSlippage,
  appCode,
  feeAmount,
}: CowProtocolActionParams) => {
  const signer = provider?.getSigner();
  const tradingSdk = new TradingSdk({
    chainId,
    signer,
    appCode: appCode || HEADER_WIDGET_APP_CODE,
  });

  if (!isChainIdSupportedByCoWProtocol(chainId)) {
    throw new Error('Chain not supported.');
  }

  if (!signer) {
    throw new Error('No signer found in provider');
  }

  const isSmartContract = await isSmartContractWallet(user, provider);
  if (isSmartContract) {
    throw new Error('Smart contract wallets should use presign.');
  }

  return tradingSdk
    .postLimitOrder(
      {
        owner: user as `0x${string}`,
        sellAmount: amount,
        buyAmount: afterNetworkCostsBuyAmount,
        kind: OrderKind.SELL,
        sellToken: tokenSrc,
        slippageBps,
        buyToken: tokenDest,
        sellTokenDecimals: tokenSrcDecimals,
        buyTokenDecimals: tokenDestDecimals,
      },
      {
        appData: COW_APP_DATA(inputSymbol, outputSymbol, slippageBps, smartSlippage, appCode),
        additionalParams: {
          networkCostsAmount: feeAmount?.toString(),
        },
      }
    )
    .then((orderResult) => orderResult.orderId);
};

export const getOrderStatus = async (orderId: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId: chainId });
  const status = await orderBookApi.getOrderCompetitionStatus(orderId, {
    chainId,
  });
  return status.type;
};

export const getOrder = async (orderId: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId });
  const order = await orderBookApi.getOrder(orderId, {
    chainId,
  });
  return order;
};

export const getOrders = async (chainId: number, account: string) => {
  const orderBookApi = new OrderBookApi({ chainId });
  const orders = await orderBookApi.getOrders({
    owner: account,
  });

  return orders;
};

export const isOrderLoading = (status: OrderStatus) => {
  return status === OrderStatus.OPEN || status === OrderStatus.PRESIGNATURE_PENDING;
};

export const isOrderFilled = (status: OrderStatus) => {
  return status === OrderStatus.FULFILLED;
};

export const isOrderExpired = (status: OrderStatus) => {
  return status === OrderStatus.EXPIRED;
};

export const isOrderCancelled = (status: OrderStatus) => {
  return status === OrderStatus.CANCELLED;
};

export const isNativeToken = (token?: string) => {
  return token?.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
};

export const getUnsignerOrder = async (
  sellAmount: string,
  buyAmount: string,
  dstToken: string,
  user: string,
  chainId: number,
  tokenFromSymbol: string,
  tokenToSymbol: string,
  slippageBps: number,
  smartSlippage: boolean,
  appCode?: string
): Promise<UnsignedOrder> => {
  const metadataApi = new MetadataApi();
  const { appDataHex } = await metadataApi.getAppDataInfo(
    COW_APP_DATA(tokenFromSymbol, tokenToSymbol, slippageBps, smartSlippage, appCode)
  );

  return {
    buyToken: dstToken,
    receiver: user,
    sellAmount,
    buyAmount,
    appData: appDataHex,
    feeAmount: '0',
    validTo: MAX_VALID_TO_EPOCH,
    partiallyFillable: false,
    kind: OrderKind.SELL,
    sellToken: WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId].address.toLowerCase(),
    buyTokenBalance: BuyTokenDestination.ERC20,
    sellTokenBalance: SellTokenSource.ERC20,
  };
};

export const populateEthFlowTx = async (
  sellAmount: string,
  buyAmount: string,
  dstToken: string,
  user: string,
  validTo: number,
  tokenFromSymbol: string,
  tokenToSymbol: string,
  slippageBps: number,
  smartSlippage: boolean,
  quoteId?: number
): Promise<PopulatedTransaction> => {
  const metadataApi = new MetadataApi();
  const { appDataHex } = await metadataApi.getAppDataInfo(
    COW_APP_DATA(tokenFromSymbol, tokenToSymbol, slippageBps, smartSlippage)
  );

  const orderData = {
    buyToken: dstToken,
    receiver: user,
    sellAmount,
    buyAmount,
    appData: appDataHex,
    feeAmount: '0',
    validTo,
    partiallyFillable: false,
    quoteId: quoteId || 0,
  };

  const value = BigNumber.from(sellAmount);

  // Create the contract interface
  const iface = new ethers.utils.Interface([COW_CREATE_ORDER_ABI]);

  // Encode the function call
  const data = iface.encodeFunctionData('createOrder', [
    [
      orderData.buyToken,
      orderData.receiver,
      orderData.sellAmount,
      orderData.buyAmount,
      orderData.appData,
      orderData.feeAmount,
      orderData.validTo,
      orderData.partiallyFillable,
      orderData.quoteId,
    ],
  ]);

  return {
    to: COW_PROTOCOL_ETH_FLOW_ADDRESS,
    value,
    data,
  };
};

export const getRecommendedSlippage = (srcUSD: string) => {
  try {
    if (Number(srcUSD) <= 0) {
      return Number(0.5);
    }

    if (Number(srcUSD) <= 1) {
      return Number(5.0);
    } else if (Number(srcUSD) <= 5) {
      return Number(2.5);
    } else if (Number(srcUSD) <= 10) {
      return Number(1.5);
    } else {
      return Number(0.5);
    }
  } catch (e) {
    return Number(0.5);
  }
};

export const uploadAppData = async (orderId: string, appDataHex: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId });

  return orderBookApi.uploadAppData(orderId, appDataHex);
};

export const generateCoWExplorerLink = (chainId: SupportedChainId, orderId?: string) => {
  if (!orderId) {
    return undefined;
  }

  const base = 'https://explorer.cow.fi';
  switch (chainId) {
    case SupportedChainId.MAINNET:
      return `${base}/orders/${orderId}`;
    case SupportedChainId.GNOSIS_CHAIN:
      return `${base}/gc/orders/${orderId}`;
    case SupportedChainId.BASE:
      return `${base}/base/orders/${orderId}`;
    case SupportedChainId.ARBITRUM_ONE:
      return `${base}/arb1/orders/${orderId}`;
    case SupportedChainId.SEPOLIA:
      return `${base}/sepolia/orders/${orderId}`;
    case SupportedChainId.AVALANCHE:
      return `${base}/avax/orders/${orderId}`;
    case SupportedChainId.POLYGON:
      return `${base}/pol/orders/${orderId}`;
    default:
      throw new Error('Define explorer link for chainId: ' + chainId);
  }
};
