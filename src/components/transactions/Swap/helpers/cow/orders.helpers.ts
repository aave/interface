import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  BuyTokenDestination,
  CowEnv,
  OrderBookApi,
  OrderClass,
  OrderKind,
  OrderParameters,
  OrderStatus,
  PriceQuality,
  QuoteAndPost,
  SellTokenSource,
  SigningScheme,
  SlippageToleranceRequest,
  SlippageToleranceResponse,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk';
import { AnyAppDataDocVersion, AppDataParams, MetadataApi } from '@cowprotocol/sdk-app-data';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers, PopulatedTransaction } from 'ethers';
import { isSmartContractWallet } from 'src/helpers/provider';

import { SignedParams } from '../../actions/approval/useSwapTokenApproval';
import {
  COW_APP_DATA,
  COW_CREATE_ORDER_ABI,
  COW_PROTOCOL_ETH_FLOW_ADDRESS_BY_ENV,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { OrderType, SwapType } from '../../types';
import { getCowTradingSdkByChainIdAndAppCode } from './env.helpers';

export const COW_ENV: CowEnv = 'staging';

const EIP_2612_PERMIT_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export type CowProtocolActionParams = {
  orderType: OrderType;
  quote?: OrderParameters;
  provider: JsonRpcProvider;
  chainId: number;
  user: string;
  sellAmount: string;
  buyAmount: string;
  tokenDest: string;
  tokenSrc: string;
  tokenSrcDecimals: number;
  tokenDestDecimals: number;
  inputSymbol: string;
  outputSymbol: string;
  slippageBps: number;
  smartSlippage: boolean;
  appCode: string;
  kind: OrderKind;
  orderBookQuote?: QuoteAndPost;
  signatureParams?: SignedParams;
  estimateGasLimit?: (tx: PopulatedTransaction, chainId?: number) => Promise<PopulatedTransaction>;
  validTo: number;
};

export const getPreSignTransaction = async ({
  provider,
  chainId,
  user,
  slippageBps,
  smartSlippage,
  inputSymbol,
  outputSymbol,
  appCode,
  orderType,
  sellAmount,
  buyAmount,
  tokenSrc,
  tokenDest,
  tokenSrcDecimals,
  tokenDestDecimals,
  kind,
  validTo,
}: CowProtocolActionParams) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) {
    throw new Error('Chain not supported.');
  }

  const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(chainId, appCode);
  const isSmartContract = await isSmartContractWallet(user, provider);
  if (!isSmartContract) {
    throw new Error('Only smart contract wallets should use presign.');
  }

  const orderResult = await tradingSdk.postLimitOrder(
    {
      sellAmount,
      buyAmount,
      kind: kind == OrderKind.SELL ? OrderKind.SELL : OrderKind.BUY,
      sellToken: tokenSrc,
      buyToken: tokenDest,
      sellTokenDecimals: tokenSrcDecimals,
      buyTokenDecimals: tokenDestDecimals,
      validTo,
      owner: user as `0x${string}`,
      env: COW_ENV,
    },
    {
      appData: COW_APP_DATA(
        inputSymbol,
        outputSymbol,
        slippageBps,
        smartSlippage,
        orderType,
        appCode
      ),
      additionalParams: {
        signingScheme: SigningScheme.PRESIGN,
      },
    }
  );

  const preSignTransaction = await tradingSdk.getPreSignTransaction({
    orderUid: orderResult.orderId,
    signer: provider?.getSigner(),
  });

  return {
    ...preSignTransaction,
    orderId: orderResult.orderId,
  };
};

// Only for EOA wallets
export const sendOrder = async ({
  provider,
  chainId,
  user,
  slippageBps,
  inputSymbol,
  outputSymbol,
  smartSlippage,
  appCode,
  orderType,
  sellAmount,
  buyAmount,
  tokenSrc,
  tokenDest,
  tokenSrcDecimals,
  tokenDestDecimals,
  kind,
  signatureParams,
  estimateGasLimit,
  validTo,
}: CowProtocolActionParams) => {
  const signer = provider?.getSigner();

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

  const permitHook =
    signatureParams && estimateGasLimit
      ? await getPermitHook({ tokenAddress: tokenSrc, signatureParams, estimateGasLimit, chainId })
      : undefined;

  const hooks = permitHook
    ? {
        pre: [permitHook],
      }
    : undefined;

  const appData = COW_APP_DATA(
    inputSymbol,
    outputSymbol,
    slippageBps,
    smartSlippage,
    orderType,
    appCode,
    hooks
  );

  const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(chainId, appCode);

  return tradingSdk
    .postLimitOrder(
      {
        sellAmount,
        buyAmount,
        kind: kind == OrderKind.SELL ? OrderKind.SELL : OrderKind.BUY,
        sellToken: tokenSrc,
        buyToken: tokenDest,
        sellTokenDecimals: tokenSrcDecimals,
        buyTokenDecimals: tokenDestDecimals,
        validTo,
        owner: user as `0x${string}`,
        env: COW_ENV,
      },
      {
        appData,
        additionalParams: {
          applyCostsSlippageAndFees: false,
        },
      }
    )
    .then((orderResult) => orderResult.orderId);
};

export const getOrderStatus = async (orderId: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId: chainId, env: COW_ENV });
  const status = await orderBookApi.getOrderCompetitionStatus(orderId, {
    chainId,
  });
  return status.type;
};

export const getOrder = async (orderId: string, chainId: number) => {
  const orderBookApi = new OrderBookApi({ chainId, env: COW_ENV });
  const order = await orderBookApi.getOrder(orderId, {
    chainId,
  });
  return order;
};

export const getOrders = async (chainId: number, account: string) => {
  const orderBookApi = new OrderBookApi({ chainId, env: COW_ENV });
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

// TODO: make object param
export const getUnsignerOrder = async ({
  sellAmount,
  buyAmount,
  dstToken,
  user,
  chainId,
  tokenFromSymbol,
  tokenToSymbol,
  slippageBps,
  smartSlippage,
  appCode,
  orderType,
  validTo,
  srcToken,
  receiver,
}: {
  sellAmount: string;
  buyAmount: string;
  dstToken: string;
  user: string;
  chainId: number;
  tokenFromSymbol: string;
  tokenToSymbol: string;
  slippageBps: number;
  smartSlippage: boolean;
  appCode: string;
  orderType: OrderType;
  validTo: number;
  srcToken?: string;
  receiver?: string;
}) => {
  const metadataApi = new MetadataApi();
  const { appDataHex } = await metadataApi.getAppDataInfo(
    COW_APP_DATA(tokenFromSymbol, tokenToSymbol, slippageBps, smartSlippage, orderType, appCode)
  );

  return {
    buyToken: dstToken,
    receiver: receiver || user,
    sellAmount,
    buyAmount,
    appData: appDataHex,
    feeAmount: '0',
    validTo: validTo,
    partiallyFillable: false,
    kind: OrderKind.SELL,
    sellToken: srcToken
      ? srcToken.toLowerCase()
      : WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId].address.toLowerCase(),
    buyTokenBalance: BuyTokenDestination.ERC20,
    sellTokenBalance: SellTokenSource.ERC20,
  };
};

export const hashAppData = async (appData: AnyAppDataDocVersion) => {
  const metadataApi = new MetadataApi();
  const { appDataHex } = await metadataApi.getAppDataInfo(appData);
  return appDataHex;
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
  appCode: string,
  orderType: OrderType,
  quoteId?: number
): Promise<PopulatedTransaction> => {
  const appDataHex = await hashAppData(
    COW_APP_DATA(tokenFromSymbol, tokenToSymbol, slippageBps, smartSlippage, orderType, appCode)
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
    to: COW_PROTOCOL_ETH_FLOW_ADDRESS_BY_ENV(COW_ENV),
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
  const orderBookApi = new OrderBookApi({ chainId, env: COW_ENV });

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
    case SupportedChainId.BNB:
      return `${base}/bnb/orders/${orderId}`;
    default:
      throw new Error('Define explorer link for chainId: ' + chainId);
  }
};

export const adjustedBps = (sdkFeeBps: number) => {
  const f = sdkFeeBps / 10000;
  const effective = f / (1 + f);
  return effective * 10000;
};

export const getPermitHook = async ({
  tokenAddress,
  signatureParams,
  estimateGasLimit,
  chainId,
}: {
  tokenAddress: string;
  signatureParams: SignedParams;
  estimateGasLimit: (tx: PopulatedTransaction, chainId?: number) => Promise<PopulatedTransaction>;
  chainId: number;
}) => {
  // Decode the owner from the stored encoded signature payload if needed
  const [owner] = ethers.utils.defaultAbiCoder.decode(
    ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
    signatureParams.signature
  );

  const iface = new ethers.utils.Interface(EIP_2612_PERMIT_ABI);
  const { v, r, s } = signatureParams.splitedSignature;
  const spender = signatureParams.approvedToken; // Vault Relayer / adapter address
  const value = signatureParams.amount;
  const deadline = signatureParams.deadline;

  const callData = iface.encodeFunctionData('permit', [owner, spender, value, deadline, v, r, s]);

  const PERMIT_HOOK_DAPP_ID = 'cow.fi';
  const gasLimit = '80000';

  const tx: PopulatedTransaction = {
    to: tokenAddress,
    data: callData,
    gasLimit: BigNumber.from(gasLimit),
  };

  const txWithGasEstimation = await estimateGasLimit(tx, chainId);

  return {
    target: txWithGasEstimation.to,
    callData: txWithGasEstimation.data,
    gasLimit: txWithGasEstimation.gasLimit?.toString(),
    dappId: PERMIT_HOOK_DAPP_ID,
  };
};

// This function is used to get the slippage suggestion for a token pair on the respective chain based on the pair volatility.
export const getSlippageSuggestion = async (
  request: SlippageToleranceRequest
): Promise<SlippageToleranceResponse> => {
  const { sellToken, buyToken } = request;

  try {
    if (request.chainId && sellToken && buyToken) {
      const chainSlug = request.chainId; // e.g., 42161 for Arbitrum
      const sell = sellToken.toLowerCase();
      const buy = buyToken.toLowerCase();
      const url = `https://bff.cow.fi/${chainSlug}/markets/${sell}-${buy}/slippageTolerance`;

      const res = await fetch(url);

      if (res.ok) {
        const result = await res.json();
        // The endpoint returns { slippageBps: number }
        // This is expected by the CoW SDK within the Slippage logic.
        return result;
      }
    }
  } catch (e) {
    console.error('Error fetching slippage suggestion:', e);
    return { slippageBps: 0 };
  }

  return { slippageBps: 0 };
};

export const addOrderTypeToAppData = (
  orderType: OrderType,
  appData?: AppDataParams
): AppDataParams => {
  return {
    ...appData,
    metadata: {
      ...appData?.metadata,
      orderClass: {
        orderClass: orderType === OrderType.LIMIT ? OrderClass.LIMIT : OrderClass.MARKET,
      },
    },
  };
};

export const priceQualityToUse = (swapType: SwapType) => {
  switch (swapType) {
    case SwapType.CollateralSwap:
    case SwapType.RepayWithCollateral:
    case SwapType.DebtSwap:
      return PriceQuality.FAST;
    default:
      return PriceQuality.FAST;
  }
};
