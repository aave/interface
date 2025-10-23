import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { BigNumberValue, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  BuyTokenDestination,
  OrderBookApi,
  OrderKind,
  OrderParameters,
  OrderStatus,
  QuoteAndPost,
  SellTokenSource,
  SigningScheme,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk';
import { AnyAppDataDocVersion, MetadataApi } from '@cowprotocol/sdk-app-data';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers, PopulatedTransaction } from 'ethers';
import { isSmartContractWallet } from 'src/helpers/provider';

import {
  COW_APP_DATA,
  COW_CREATE_ORDER_ABI,
  COW_PARTNER_FEE,
  COW_PROTOCOL_ETH_FLOW_ADDRESS,
  isChainIdSupportedByCoWProtocol,
} from '../../constants/cow.constants';
import { isCowProtocolRates, OrderType, SwapState } from '../../types';
import { getCowTradingSdkByChainIdAndAppCode } from './env.helpers';

export type CowProtocolActionParams = {
  orderType: OrderType;
  quote: OrderParameters;
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
  orderBookQuote: QuoteAndPost;
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
  orderBookQuote,
  orderType,
  sellAmount,
  buyAmount,
  tokenSrc,
  tokenDest,
  tokenSrcDecimals,
  tokenDestDecimals,
  kind,
}: CowProtocolActionParams) => {
  if (!isChainIdSupportedByCoWProtocol(chainId)) {
    throw new Error('Chain not supported.');
  }

  const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(chainId, appCode);
  const isSmartContract = await isSmartContractWallet(user, provider);
  if (!isSmartContract) {
    throw new Error('Only smart contract wallets should use presign.');
  }

  let orderResult;
  if (orderType === OrderType.LIMIT) {
    orderResult = await tradingSdk.postLimitOrder(
      {
        sellAmount,
        buyAmount,
        kind: kind == OrderKind.SELL ? OrderKind.SELL : OrderKind.BUY,
        sellToken: tokenSrc,
        buyToken: tokenDest,
        sellTokenDecimals: tokenSrcDecimals,
        buyTokenDecimals: tokenDestDecimals,
        owner: user as `0x${string}`,
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
  } else {
    orderResult = await orderBookQuote.postSwapOrderFromQuote({
      additionalParams: {
        signingScheme: SigningScheme.PRESIGN,
      },
      appData: COW_APP_DATA(
        inputSymbol,
        outputSymbol,
        slippageBps,
        smartSlippage,
        orderType,
        appCode
      ),
    });
  }

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
  orderBookQuote,
  orderType,
  sellAmount,
  buyAmount,
  tokenSrc,
  tokenDest,
  tokenSrcDecimals,
  tokenDestDecimals,
  kind,
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

  if (orderType === OrderType.LIMIT) {
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
          owner: user as `0x${string}`,
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
        }
      )
      .then((orderResult) => orderResult.orderId);
  } else {
    return orderBookQuote
      .postSwapOrderFromQuote({
        appData: COW_APP_DATA(
          inputSymbol,
          outputSymbol,
          slippageBps,
          smartSlippage,
          orderType,
          appCode
        ),
      })
      .then((orderResult) => orderResult.orderId);
  }
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

export const sellAmountBeforeCostsIncluded = (
  state: SwapState,
  extraAmountToAdd?: BigNumberValue
) => {
  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return '';

  const extraAmount = extraAmountToAdd
    ? valueToBigNumber(extraAmountToAdd.toString())
    : valueToBigNumber('0');

  if (state.orderType === OrderType.MARKET) {
    return valueToBigNumber(state.swapRate.srcSpotAmount).plus(extraAmount).toString();
  } else {
    if (state.side === 'sell') {
      return normalizeBN(state.inputAmount, -state.sourceToken.decimals)
        .minus(extraAmount)
        .toString();
    } else {
      const sellAmount = valueToBigNumber(
        normalizeBN(state.inputAmount, -state.sourceToken.decimals)
      );
      const sellAmountBeforeNetworkCosts = sellAmount;
      const originalPartnerFeeBps = COW_PARTNER_FEE(
        state.sourceToken.symbol,
        state.destinationToken.symbol
      ).volumeBps;
      const adjustedPartnerFeeBps = adjustedBps(originalPartnerFeeBps);
      const partnerFeeAmount = sellAmountBeforeNetworkCosts
        .multipliedBy(adjustedPartnerFeeBps)
        .dividedBy(10000)
        .toFixed(0);

      return valueToBigNumber(normalizeBN(state.inputAmount, -state.sourceToken.decimals))
        .plus(partnerFeeAmount)
        .plus(extraAmount)
        .toString();
    }
  }
};

export const sellAmountWithCostsIncluded = (
  state: SwapState,
  extraAmountToAdd?: BigNumberValue
) => {
  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return '';

  const extraAmount = extraAmountToAdd
    ? valueToBigNumber(extraAmountToAdd.toString())
    : valueToBigNumber('0');

  if (state.orderType === OrderType.MARKET) {
    return valueToBigNumber(state.swapRate.srcSpotAmount).plus(extraAmount).toString();
  } else {
    if (state.side === 'sell') {
      return normalizeBN(state.inputAmount, -state.sourceToken.decimals)
        .plus(extraAmount)
        .toString();
    } else {
      const sellAmount = valueToBigNumber(
        normalizeBN(state.inputAmount, -state.sourceToken.decimals)
      );
      const sellAmountBeforeNetworkCosts = sellAmount;
      const originalPartnerFeeBps = COW_PARTNER_FEE(
        state.sourceToken.symbol,
        state.destinationToken.symbol
      ).volumeBps;
      const adjustedPartnerFeeBps = adjustedBps(originalPartnerFeeBps);
      const partnerFeeAmount = sellAmountBeforeNetworkCosts
        .multipliedBy(adjustedPartnerFeeBps)
        .dividedBy(10000)
        .toFixed(0);

      return valueToBigNumber(normalizeBN(state.inputAmount, -state.sourceToken.decimals))
        .minus(partnerFeeAmount)
        .plus(extraAmount)
        .toString();
    }
  }
};

export const buyAmountWithCostsIncluded = (state: SwapState, extraAmountToAdd?: BigNumberValue) => {
  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return '';
  const extraAmount = extraAmountToAdd
    ? valueToBigNumber(extraAmountToAdd.toString())
    : valueToBigNumber('0');

  if (state.orderType === OrderType.MARKET) {
    if (isNativeToken(state.destinationToken.addressToSwap)) {
      const destAmountWithSlippage = valueToBigNumber(state.swapRate.destSpotAmount)
        .multipliedBy(valueToBigNumber(1).minus(valueToBigNumber(state.slippage).dividedBy(100)))
        .toFixed(0);
      return valueToBigNumber(destAmountWithSlippage).plus(extraAmount).toString();
    } else {
      return valueToBigNumber(state.swapRate.amountAndCosts.afterNetworkCosts.buyAmount.toString())
        .plus(extraAmount)
        .toString();
    }
  } else {
    if (state.side === 'sell') {
      const buyAmount = normalizeBN(state.outputAmount, -state.destinationToken.decimals);
      const sellAmount = normalizeBN(state.inputAmount, -state.sourceToken.decimals);
      const sellAmountBeforeNetworkCosts = sellAmount;
      const buyAmountAfterNetworkCosts = buyAmount;
      const networkCostsAmount = valueToBigNumber('0');
      const sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts.plus(networkCostsAmount);
      const buyAmountBeforeNetworkCosts = buyAmountAfterNetworkCosts
        .dividedBy(sellAmountBeforeNetworkCosts)
        .multipliedBy(sellAmountAfterNetworkCosts);
      const partnerFeeBps = COW_PARTNER_FEE(
        state.sourceToken.symbol,
        state.destinationToken.symbol
      ).volumeBps;
      const adjustedPartnerFeeBps = adjustedBps(partnerFeeBps);
      const partnerFeeAmount = buyAmountBeforeNetworkCosts
        .multipliedBy(adjustedPartnerFeeBps)
        .dividedBy(10000)
        .toFixed(0);

      return valueToBigNumber(normalizeBN(state.outputAmount, -state.destinationToken.decimals))
        .plus(partnerFeeAmount)
        .plus(extraAmount)
        .toString();
    } else {
      return normalizeBN(state.outputAmount, -state.destinationToken.decimals)
        .plus(extraAmount)
        .toString();
    }
  }
};

export const buyAmountBeforeCostsIncluded = (
  state: SwapState,
  extraAmountToAdd?: BigNumberValue
) => {
  if (!state.swapRate || !isCowProtocolRates(state.swapRate)) return '';
  const extraAmount = extraAmountToAdd
    ? valueToBigNumber(extraAmountToAdd.toString())
    : valueToBigNumber('0');

  if (state.orderType === OrderType.MARKET) {
    if (isNativeToken(state.destinationToken.addressToSwap)) {
      const destAmountWithSlippage = valueToBigNumber(state.swapRate.destSpotAmount)
        .multipliedBy(valueToBigNumber(1).minus(valueToBigNumber(state.slippage).dividedBy(100)))
        .toFixed(0);
      return valueToBigNumber(destAmountWithSlippage).plus(extraAmount).toString();
    } else {
      return valueToBigNumber(state.swapRate.amountAndCosts.afterNetworkCosts.buyAmount.toString())
        .plus(extraAmount)
        .toString();
    }
  } else {
    if (state.side === 'sell') {
      const buyAmount = normalizeBN(state.outputAmount, -state.destinationToken.decimals);
      const sellAmount = normalizeBN(state.inputAmount, -state.sourceToken.decimals);
      const sellAmountBeforeNetworkCosts = sellAmount;
      const buyAmountAfterNetworkCosts = buyAmount;
      const networkCostsAmount = valueToBigNumber('0');
      const sellAmountAfterNetworkCosts = sellAmountBeforeNetworkCosts.plus(networkCostsAmount);
      const buyAmountBeforeNetworkCosts = buyAmountAfterNetworkCosts
        .dividedBy(sellAmountBeforeNetworkCosts)
        .multipliedBy(sellAmountAfterNetworkCosts);
      const partnerFeeBps = COW_PARTNER_FEE(
        state.sourceToken.symbol,
        state.destinationToken.symbol
      ).volumeBps;
      const adjustedPartnerFeeBps = adjustedBps(partnerFeeBps);
      const partnerFeeAmount = buyAmountBeforeNetworkCosts
        .multipliedBy(adjustedPartnerFeeBps)
        .dividedBy(10000)
        .toFixed(0);

      return valueToBigNumber(normalizeBN(state.outputAmount, -state.destinationToken.decimals))
        .minus(partnerFeeAmount)
        .plus(extraAmount)
        .toString();
    } else {
      return normalizeBN(state.outputAmount, -state.destinationToken.decimals)
        .plus(extraAmount)
        .toString();
    }
  }
};
