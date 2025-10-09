import {
  chainId,
  evmAddress,
  OrderDirection,
  PageSize,
  useUserTransactionHistory,
} from '@aave/react';
import { Cursor } from '@aave/types';
import { OrderBookApi } from '@cowprotocol/cow-sdk';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ADAPTER_APP_CODE,
  HEADER_WIDGET_APP_CODE,
} from 'src/components/transactions/Switch/cowprotocol/cowprotocol.helpers';
import { isChainIdSupportedByCoWProtocol } from 'src/components/transactions/Switch/switch.constants';
import { getTransactionAction, getTransactionId } from 'src/modules/history/helpers';
import {
  actionFilterMap,
  hasCollateralReserve,
  hasPrincipalReserve,
  hasReserve,
  hasSrcOrDestToken,
  HistoryFilters,
  TransactionHistoryItemUnion,
  UserTransactionItem,
} from 'src/modules/history/types';
import { ERC20Service } from 'src/services/Erc20Service';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TOKEN_LIST } from 'src/ui-config/TokenList';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { useAppDataContext } from './app-data-provider/useAppDataProvider';

const sortTransactionsByTimestampDesc = (
  a: TransactionHistoryItemUnion,
  b: TransactionHistoryItemUnion
) => {
  const aTime = '__typename' in a ? new Date(a.timestamp).getTime() : a.timestamp * 1000;
  const bTime = '__typename' in b ? new Date(b.timestamp).getTime() : b.timestamp * 1000;
  return bTime - aTime;
};

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

      //SDK structure
      if (hasCollateralReserve(txn)) {
        collateralSymbol = txn.collateral.reserve.underlyingToken.symbol.toLowerCase();
        collateralName = txn.collateral.reserve.underlyingToken.name.toLowerCase();
      }

      if (hasPrincipalReserve(txn)) {
        principalSymbol = txn.debtRepaid.reserve.underlyingToken.symbol.toLowerCase();
        principalName = txn.debtRepaid.reserve.underlyingToken.name.toLowerCase();
      }

      if (hasReserve(txn)) {
        symbol = txn.reserve.underlyingToken.symbol.toLowerCase();
        name = txn.reserve.underlyingToken.name.toLowerCase();
      }

      // CowSwap structure
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
      const action = getTransactionAction(txn);
      if (filterQuery.includes(actionFilterMap(action))) {
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
  const [sdkCursor, setSdkCursor] = useState<Cursor | null>(null);
  const [sdkTransactions, setSdkTransactions] = useState<UserTransactionItem[]>([]);
  const sdkTransactionIds = useRef<Set<string>>(new Set());
  const [isFetchingAllSdkPages, setIsFetchingAllSdkPages] = useState(true);
  const [hasLoadedInitialSdkPage, setHasLoadedInitialSdkPage] = useState(false);
  const [shouldKeepFetching, setShouldKeepFetching] = useState(false);

  const isAccountValid = account && account.length > 0;

  const {
    data: sdkData,
    loading: sdkLoading,
    error: sdkError,
  } = useUserTransactionHistory({
    market: evmAddress(currentMarketData.addresses.LENDING_POOL),
    user: isAccountValid
      ? evmAddress(account as string)
      : evmAddress('0x0000000000000000000000000000000000000000'),
    chainId: chainId(currentMarketData.chainId),
    orderBy: { date: OrderDirection.Desc },
    pageSize: PageSize.Fifty,
    cursor: sdkCursor,
  });

  useEffect(() => {
    setSdkCursor(null);
    setSdkTransactions([]);
    sdkTransactionIds.current.clear();
    setIsFetchingAllSdkPages(true);
    setHasLoadedInitialSdkPage(false);
  }, [account, currentMarketData.addresses.LENDING_POOL, currentMarketData.chainId]);

  useEffect(() => {
    if (!sdkData?.items?.length) {
      if (!sdkLoading && !sdkData?.pageInfo?.next) {
        setIsFetchingAllSdkPages(false);
        if (!hasLoadedInitialSdkPage) {
          setHasLoadedInitialSdkPage(true);
        }
      }
      return;
    }

    const newTransactions = sdkData.items.filter((transaction) => {
      const transactionId = getTransactionId(transaction);
      if (sdkTransactionIds.current.has(transactionId)) {
        return false;
      }
      sdkTransactionIds.current.add(transactionId);
      return true;
    });

    if (newTransactions.length > 0) {
      setSdkTransactions((prev) => [...prev, ...newTransactions]);
      if (!hasLoadedInitialSdkPage) {
        setHasLoadedInitialSdkPage(true);
      }
    }
  }, [sdkData, sdkLoading, hasLoadedInitialSdkPage]);

  useEffect(() => {
    if (sdkLoading) {
      setIsFetchingAllSdkPages(true);
      return;
    }

    const nextCursor = sdkData?.pageInfo?.next ?? null;
    if (nextCursor && nextCursor !== sdkCursor) {
      setIsFetchingAllSdkPages(true);
      setSdkCursor(nextCursor);
      return;
    }

    if (!nextCursor) {
      setIsFetchingAllSdkPages(false);
    }
  }, [sdkData?.pageInfo?.next, sdkLoading, sdkCursor]);

  useEffect(() => {
    if (sdkError && !hasLoadedInitialSdkPage) {
      setHasLoadedInitialSdkPage(true);
      setIsFetchingAllSdkPages(false);
    }
  }, [sdkError, hasLoadedInitialSdkPage]);

  const getSDKTransactions = (): UserTransactionItem[] => {
    return sdkTransactions;
  };

  const fetchForDownload = async ({
    searchQuery,
    filterQuery,
  }: HistoryFilters): Promise<TransactionHistoryItemUnion[]> => {
    const sdkTransactions = getSDKTransactions();
    const skip = 0;
    const allCowSwapOrders = await fetchCowSwapsHistory(PAGE_SIZE, skip);

    const allTransactions: TransactionHistoryItemUnion[] = [
      ...sdkTransactions,
      ...allCowSwapOrders,
    ];

    const filteredTxns = applyTxHistoryFilters({ searchQuery, filterQuery, txns: allTransactions });
    return filteredTxns;
  };

  const fetchCowSwapsHistory = async (first: number, skip: number) => {
    const chainId = currentMarketData.chainId;
    if (!isChainIdSupportedByCoWProtocol(chainId)) {
      return [];
    }

    const orderBookApi = new OrderBookApi({ chainId: chainId });
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

            if (appCode == HEADER_WIDGET_APP_CODE || appCode == ADAPTER_APP_CODE) {
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

        return {
          action: srcToken.isAToken ? 'CowCollateralSwap' : 'CowSwap',
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

  const PAGE_SIZE = 50; //Limit SDK and CowSwap to same page size

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
      const cowSwapOrders = await fetchCowSwapsHistory(PAGE_SIZE, pageParam);
      return cowSwapOrders.sort(sortTransactionsByTimestampDesc);
    },
    enabled: !!account && !reservesLoading && !!reserves && !sdkLoading,
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

  const mergedData = useMemo(() => {
    if (!data) {
      if (sdkTransactions.length === 0) {
        return data;
      }

      return {
        pageParams: [0],
        pages: [sdkTransactions.slice().sort(sortTransactionsByTimestampDesc)],
      };
    }

    const pagesWithSdk = data.pages.map((page, index) => {
      if (index === 0) {
        const combined = [...sdkTransactions, ...page];
        return combined.sort(sortTransactionsByTimestampDesc);
      }
      return page;
    });

    return {
      ...data,
      pages: pagesWithSdk,
    };
  }, [data, sdkTransactions]);

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

  const isInitialSdkLoading = !hasLoadedInitialSdkPage && (sdkLoading || isFetchingAllSdkPages);

  return {
    data: mergedData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: reservesLoading || isLoadingHistory || isInitialSdkLoading,
    isError: isError || !!sdkError,
    error: error || sdkError,
    fetchForDownload,
  };
};
