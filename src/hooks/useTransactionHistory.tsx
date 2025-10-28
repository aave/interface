import { OrderBookApi } from '@cowprotocol/cow-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { isChainIdSupportedByCoWProtocol } from 'src/components/transactions/Swap/constants/cow.constants';
import {
  APP_CODE_PER_SWAP_TYPE,
  APP_CODE_VALUES,
} from 'src/components/transactions/Swap/constants/shared.constants';
import { SwapType } from 'src/components/transactions/Swap/types';
import {
  actionFilterMap,
  hasCollateralReserve,
  hasPrincipalReserve,
  hasReserve,
  hasSrcOrDestToken,
  HistoryFilters,
  swapTypeToTransactionHistoryItemType,
  TransactionHistoryItemUnion,
} from 'src/modules/history/types';
import {
  USER_TRANSACTIONS_V2,
  USER_TRANSACTIONS_V2_WITH_POOL,
} from 'src/modules/history/v2-user-history-query';
import { USER_TRANSACTIONS_V3 } from 'src/modules/history/v3-user-history-query';
import { ERC20Service } from 'src/services/Erc20Service';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';

export const applyTxHistoryFilters = ({
  searchQuery,
  filterQuery,
  txns,
}: HistoryFilters & { txns: TransactionHistoryItemUnion[] }) => {
  let filteredTxns: TransactionHistoryItemUnion[];

  // Apply search filter
  if (searchQuery.length > 0) {
    const lowerSearchQuery = searchQuery.toLowerCase();

    filteredTxns = txns.filter((txn: TransactionHistoryItemUnion) => {
      let collateralSymbol = '';
      let principalSymbol = '';
      let collateralName = '';
      let principalName = '';
      let symbol = '';
      let name = '';
      let srcToken = '';
      let destToken = '';

      if (hasCollateralReserve(txn)) {
        collateralSymbol = txn.collateralReserve.symbol.toLowerCase();
        collateralName = txn.collateralReserve.name.toLowerCase();
      }

      if (hasPrincipalReserve(txn)) {
        principalSymbol = txn.principalReserve.symbol.toLowerCase();
        principalName = txn.principalReserve.name.toLowerCase();
      }

      if (hasReserve(txn)) {
        symbol = txn.reserve.symbol.toLowerCase();
        name = txn.reserve.name.toLowerCase();
      }

      if (hasSrcOrDestToken(txn)) {
        srcToken = txn.underlyingSrcToken.symbol.toLowerCase();
        destToken = txn.underlyingDestToken.symbol.toLowerCase();
      }

      // handle special case where user searches for ethereum but asset names are abbreviated as ether
      const altName = name.includes('ether') && !name.includes('tether') ? 'ethereum' : '';

      return (
        symbol.includes(lowerSearchQuery) ||
        collateralSymbol.includes(lowerSearchQuery) ||
        principalSymbol.includes(lowerSearchQuery) ||
        name.includes(lowerSearchQuery) ||
        altName.includes(lowerSearchQuery) ||
        collateralName.includes(lowerSearchQuery) ||
        principalName.includes(lowerSearchQuery) ||
        srcToken.includes(lowerSearchQuery) ||
        destToken.includes(lowerSearchQuery)
      );
    });
  } else {
    filteredTxns = txns;
  }

  // apply txn type filter
  if (filterQuery.length > 0) {
    filteredTxns = filteredTxns.filter((txn: TransactionHistoryItemUnion) => {
      if (filterQuery.includes(actionFilterMap(txn.action))) {
        return true;
      } else {
        return false;
      }
    });
  }
  return filteredTxns;
};

export const useTransactionHistory = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const [currentMarketData, account] = useRootStore(
    useShallow((state) => [state.currentMarketData, state.account])
  );

  const { reserves, loading: reservesLoading } = useAppDataContext();

  const [shouldKeepFetching, setShouldKeepFetching] = useState(false);

  // Handle subgraphs with multiple markets (currently only ETH V2 and ETH V2 AMM)
  let selectedPool: string | undefined = undefined;
  if (!currentMarketData.v3 && currentMarketData.marketTitle === 'Ethereum') {
    selectedPool = currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER.toLowerCase();
  }

  interface TransactionHistoryParams {
    account: string;
    subgraphUrl: string;
    first: number;
    skip: number;
    v3: boolean;
    pool?: string;
  }
  const fetchTransactionHistory = async ({
    account,
    subgraphUrl,
    first,
    skip,
    v3,
    pool,
  }: TransactionHistoryParams) => {
    let query = '';
    if (v3) {
      query = USER_TRANSACTIONS_V3;
    } else if (pool) {
      query = USER_TRANSACTIONS_V2_WITH_POOL;
    } else {
      query = USER_TRANSACTIONS_V2;
    }

    const requestBody = {
      query,
      variables: { userAddress: account, first, skip, pool },
    };
    try {
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.userTransactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  };

  const fetchForDownload = async ({
    searchQuery,
    filterQuery,
  }: HistoryFilters): Promise<TransactionHistoryItemUnion[]> => {
    const allTransactions = [];
    const batchSize = 100;
    let skip = 0;
    let currentBatchSize = batchSize;

    // Pagination over multiple sources is not perfect but since this is not a user facing feature, it's not noticeable
    while (currentBatchSize === batchSize) {
      const currentBatch = await fetchTransactionHistory({
        first: batchSize,
        skip: skip,
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        v3: !!currentMarketData.v3,
        pool: selectedPool,
      });
      const cowSwapOrders = await fetchCowSwapsHistory(batchSize, skip * batchSize);
      allTransactions.push(...currentBatch, ...cowSwapOrders);
      currentBatchSize = currentBatch.length;
      skip += batchSize;
    }

    const filteredTxns = applyTxHistoryFilters({ searchQuery, filterQuery, txns: allTransactions });
    return filteredTxns;
  };

  const fetchCowSwapsHistory = async (first: number, skip: number) => {
    const chainId = currentMarketData.chainId;
    if (!isChainIdSupportedByCoWProtocol(chainId)) {
      return [];
    }

    const orderBookApi = new OrderBookApi({ chainId: chainId, env: 'staging' }); // TODO: use prod for production
    const orders = await orderBookApi.getOrders({
      owner: account,
      limit: first,
      offset: skip,
    });

    const filteredCowAaveOrders = (
      await Promise.all(
        orders.map(async (order) => {
          try {
            const appData = JSON.parse(order.fullAppData ?? '{}');
            const appCode = appData.appCode;

            if (APP_CODE_VALUES.includes(appCode)) {
              return order;
            }
          } catch (error) {
            console.error('Error parsing app data:', error);
          }
          return null;
        })
      )
    ).filter((order) => order !== null);

    return Promise.all(
      filteredCowAaveOrders.map<Promise<TransactionHistoryItemUnion | null>>(async (order) => {
        const erc20Service = new ERC20Service(getProvider);

        // Helper function to find token info from pool reserves
        const findTokenFromReserves: (tokenAddress: string) =>
          | {
              address: string;
              name: string;
              symbol: string;
              decimals: number;
              isAToken?: boolean;
            }
          | undefined = (tokenAddress: string) => {
          const reserve = reserves?.find(
            (reserve) =>
              reserve.underlyingAsset.toLowerCase() === tokenAddress.toLowerCase() ||
              reserve.aTokenAddress.toLowerCase() === tokenAddress.toLowerCase()
          );

          if (reserve) {
            return {
              address: tokenAddress,
              name: reserve.name,
              symbol: reserve.symbol,
              decimals: reserve.decimals,
              isAToken: reserve.aTokenAddress.toLowerCase() === tokenAddress.toLowerCase(),
            };
          }
          return undefined;
        };

        let srcToken = findTokenFromReserves(order.sellToken);
        let destToken = findTokenFromReserves(order.buyToken);

        // Fallback to TOKEN_LIST if not found in pool reserves (for non-Aave tokens)
        if (!srcToken) {
          srcToken = TOKEN_LIST.tokens.find(
            (token) =>
              token.chainId == chainId &&
              token.address.toLowerCase() == order.sellToken.toLowerCase()
          );
        }

        if (!destToken) {
          destToken = TOKEN_LIST.tokens.find(
            (token) =>
              token.chainId == chainId &&
              token.address.toLowerCase() == order.buyToken.toLowerCase()
          );
        }

        // Custom tokens - only if erc20Service is available
        if (!srcToken && erc20Service) {
          srcToken = await erc20Service
            .getTokenInfo(order.sellToken, chainId)
            .then((token) => ({ ...token, underlyingAsset: token.address }))
            .catch(() => {
              console.error('Error fetching custom token', order.sellToken);
              return undefined;
            });
        }

        if (!destToken && erc20Service) {
          destToken = await erc20Service
            .getTokenInfo(order.buyToken, chainId)
            .then((token) => ({ ...token, underlyingAsset: token.address }))
            .catch(() => {
              console.error('Error fetching custom token', order.buyToken);
              return undefined;
            });
        }

        // Otherwise, we can not display it
        if (!srcToken || !destToken) {
          return null;
        }

        // We define the Order's swap type based on the app code
        const appCode = (() => {
          try {
            return JSON.parse(order.fullAppData ?? '{}').appCode;
          } catch (e) {
            console.error('Error parsing order.fullAppData:', order.fullAppData, e);
            return undefined;
          }
        })();

        const swapType = Object.entries(APP_CODE_PER_SWAP_TYPE).find(
          ([, code]) => code === appCode
        )?.[0] as keyof typeof APP_CODE_PER_SWAP_TYPE | undefined;

        console.log('swapType', swapType);

        return {
          action: swapTypeToTransactionHistoryItemType(swapType ?? SwapType.Swap) ?? '',
          id: order.uid,
          timestamp: Math.floor(new Date(order.creationDate).getTime() / 1000),
          underlyingSrcToken: {
            underlyingAsset: srcToken.address,
            name: srcToken.name,
            symbol: srcToken.symbol,
            decimals: srcToken.decimals,
          },
          srcAToken: srcToken.isAToken,
          underlyingDestToken: {
            underlyingAsset: destToken.address,
            name: destToken.name,
            symbol: destToken.symbol,
            decimals: destToken.decimals,
          },
          destAToken: destToken.isAToken,
          srcAmount:
            order.executedSellAmount && order.executedBuyAmount != '0'
              ? order.executedSellAmount
              : order.sellAmount,
          destAmount:
            order.executedBuyAmount && order.executedSellAmount != '0'
              ? order.executedBuyAmount
              : order.buyAmount,
          status: order.status,
          orderId: order.uid,
          chainId: chainId,
        };
      })
    ).then((txns) => txns.filter((txn) => txn !== null));
  };

  const PAGE_SIZE = 100;
  // Pagination over multiple sources is not perfect but since we are using an infinite query, won't be noticeable
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: queryKeysFactory.transactionHistory(account, currentMarketData),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetchTransactionHistory({
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        first: PAGE_SIZE,
        skip: pageParam,
        v3: !!currentMarketData.v3,
        pool: selectedPool,
      });
      const cowSwapOrders = await fetchCowSwapsHistory(PAGE_SIZE, pageParam * PAGE_SIZE);
      return [...response, ...cowSwapOrders].sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!account && !!currentMarketData.subgraphUrl && !reservesLoading && !!reserves,
    getNextPageParam: (
      lastPage: TransactionHistoryItemUnion[],
      allPages: TransactionHistoryItemUnion[][]
    ) => {
      const moreDataAvailable = lastPage.length === PAGE_SIZE;
      if (!moreDataAvailable) {
        return undefined;
      }
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
  });

  // If filter is active, keep fetching until all data is returned so that it's guaranteed all filter results will be returned
  useEffect(() => {
    if (isFilterActive && hasNextPage && !isFetchingNextPage) {
      setShouldKeepFetching(true);
    } else {
      setShouldKeepFetching(false);
    }
  }, [isFilterActive, hasNextPage, isFetchingNextPage]);

  // Trigger a fetch when shouldKeepFetching is set to true
  useEffect(() => {
    if (reservesLoading) {
      // Wait for reserves to load
      return;
    }

    if (shouldKeepFetching) {
      fetchNextPage();
    }
  }, [shouldKeepFetching, fetchNextPage, reservesLoading]);

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: reservesLoading || isLoadingHistory,
    isError,
    error,
    fetchForDownload,
    subgraphUrl: currentMarketData.subgraphUrl,
  };
};
