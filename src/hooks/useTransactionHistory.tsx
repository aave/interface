import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import {
  actionFilterMap,
  hasCollateralReserve,
  hasPrincipalReserve,
  hasReserve,
  HistoryFilters,
  TransactionHistoryItemUnion,
} from 'src/modules/history/types';
import {
  USER_TRANSACTIONS_V2,
  USER_TRANSACTIONS_V2_WITH_POOL,
} from 'src/modules/history/v2-user-history-query';
import { USER_TRANSACTIONS_V3 } from 'src/modules/history/v3-user-history-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';

export const applyTxHistoryFilters = ({
  searchQuery,
  filterQuery,
  txns,
}: HistoryFilters & { txns: TransactionHistoryItemUnion[] }) => {
  let filteredTxns: TransactionHistoryItemUnion[];

  // Apply seach filter
  if (searchQuery.length > 0) {
    const lowerSearchQuery = searchQuery.toLowerCase();

    filteredTxns = txns.filter((txn: TransactionHistoryItemUnion) => {
      let collateralSymbol = '';
      let principalSymbol = '';
      let collateralName = '';
      let principalName = '';
      let symbol = '';
      let name = '';

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

      // handle special case where user searches for ethereum but asset names are abbreviated as ether
      const altName = name.includes('ether') ? 'ethereum' : '';

      return (
        symbol.includes(lowerSearchQuery) ||
        collateralSymbol.includes(lowerSearchQuery) ||
        principalSymbol.includes(lowerSearchQuery) ||
        name.includes(lowerSearchQuery) ||
        altName.includes(lowerSearchQuery) ||
        collateralName.includes(lowerSearchQuery) ||
        principalName.includes(lowerSearchQuery)
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

export const useTransactionHistory = () => {
  const [currentMarketData, account] = useRootStore((state) => [
    state.currentMarketData,
    state.account,
  ]);

  // Handle subgraphs with multiple markets (currently only ETH V2 and ETH V2 AMM)
  let selectedPool: string | undefined = undefined;
  if (
    !currentMarketData.v3 &&
    (currentMarketData.marketTitle === 'Ethereum' ||
      currentMarketData.marketTitle === 'Ethereum AMM')
  ) {
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
      return data.data.userTransactions || [];
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

    while (currentBatchSize === batchSize) {
      const currentBatch = await fetchTransactionHistory({
        first: batchSize,
        skip: skip,
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        v3: !!currentMarketData.v3,
        pool: selectedPool,
      });
      currentBatchSize = currentBatch.length;
      allTransactions.push(...currentBatch);
      skip += batchSize;
    }

    const filteredTxns = applyTxHistoryFilters({ searchQuery, filterQuery, txns: allTransactions });
    return filteredTxns;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
  }: UseInfiniteQueryResult<TransactionHistoryItemUnion[], Error> = useInfiniteQuery(
    [
      QueryKeys.TRANSACTION_HISTORY,
      account,
      currentMarketData.subgraphUrl,
      currentMarketData.marketTitle,
    ],
    async ({ pageParam = 0 }) => {
      const response = await fetchTransactionHistory({
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        first: 100,
        skip: pageParam,
        v3: !!currentMarketData.v3,
        pool: selectedPool,
      });
      return response;
    },
    {
      enabled: !!account && !!currentMarketData.subgraphUrl,
      getNextPageParam: (
        lastPage: TransactionHistoryItemUnion[],
        allPages: TransactionHistoryItemUnion[][]
      ) => {
        const moreDataAvailable = lastPage.length === 100;
        if (!moreDataAvailable) {
          return undefined;
        }
        return allPages.length * 100;
      },
    }
  );

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    fetchForDownload,
  };
};
