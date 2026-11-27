import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { CowEnv, OrderBookApi, OrderStatus, SupportedChainId } from '@cowprotocol/cow-sdk';

export const COW_ENV: CowEnv = 'prod';

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
    case SupportedChainId.LINEA:
      return `${base}/linea/orders/${orderId}`;
    case SupportedChainId.PLASMA:
      return `${base}/plasma/orders/${orderId}`;
    default:
      throw new Error('Define explorer link for chainId: ' + chainId);
  }
};
