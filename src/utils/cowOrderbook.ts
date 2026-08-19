import type { OrderStatus } from '@cowprotocol/cow-sdk';

export type CowOrderbookOrder = {
  uid: string;
  creationDate: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  executedSellAmount?: string;
  executedBuyAmount?: string;
  fullAppData?: string;
  status: OrderStatus;
};

const COW_API_CHAIN_SLUGS: Record<number, string> = {
  1: 'mainnet',
  100: 'xdai',
  42161: 'arbitrum_one',
  8453: 'base',
  11155111: 'sepolia',
  43114: 'avalanche',
  137: 'polygon',
  56: 'bnb',
  59144: 'linea',
  9745: 'plasma',
  57073: 'ink',
};

export const getCowOrderbookChainSlug = (chainId: number) => {
  return COW_API_CHAIN_SLUGS[chainId];
};

const fetchCowOrderbookProxy = async <T>(path: string, params: Record<string, string>) => {
  const urlParams = new URLSearchParams(params);
  const response = await fetch(`${path}?${urlParams.toString()}`);

  if (!response.ok) {
    throw new Error(`CoW orderbook proxy request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchCowOrders = ({
  chainId,
  owner,
  limit,
  offset,
}: {
  chainId: number;
  owner: string;
  limit: number;
  offset: number;
}) =>
  fetchCowOrderbookProxy<CowOrderbookOrder[]>('/api/cow-orders/', {
    chainId: String(chainId),
    owner,
    limit: String(limit),
    offset: String(offset),
  });

export const fetchCowOrder = ({ chainId, orderUid }: { chainId: number; orderUid: string }) =>
  fetchCowOrderbookProxy<CowOrderbookOrder>('/api/cow-order/', {
    chainId: String(chainId),
    orderUid,
  });
