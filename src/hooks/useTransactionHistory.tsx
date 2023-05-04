import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import {
  USER_TRANSACTIONS_V2,
  USER_TRANSACTIONS_V2_WITH_POOL,
} from 'src/modules/history/v2-user-history-query';
import { USER_TRANSACTIONS_V3 } from 'src/modules/history/v3-user-history-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';

export type TransactionHistoryItem<T = unknown> = {
  id: string;
  txHash: string;
  action: string;
  pool: {
    id: string;
  };
  timestamp: number;
} & T;

type ReserveSubset = {
  symbol: string;
  decimals: number;
  underlyingAsset: string;
  name: string;
};

export type ActionFields = {
  Supply: {
    reserve: ReserveSubset;
    amount: string;
  };
  Deposit: {
    reserve: ReserveSubset;
    amount: string;
  };
  Borrow: {
    reserve: ReserveSubset;
    amount: string;
  };
  Repay: {
    reserve: ReserveSubset;
    amount: string;
  };
  RedeemUnderlying: {
    reserve: ReserveSubset;
    amount: string;
  };
  LiquidationCall: {
    collateralReserve: ReserveSubset;
    collateralAmount: string;
    principalReserve: ReserveSubset;
    principalAmount: string;
  };
  SwapBorrowRate: {
    reserve: ReserveSubset;
    borrowRateModeFrom: string;
    borrowRateModeTo: string;
    stableBorrowRate: string;
    variableBorrowRate: string;
  };
  Swap: {
    reserve: ReserveSubset;
    borrowRateModeFrom: number;
    borrowRateModeTo: number;
    stableBorrowRate: string;
    variableBorrowRate: string;
  };
  UsageAsCollateral: {
    reserve: ReserveSubset;
    fromState: boolean;
    toState: boolean;
  };
};

interface HistoryFilters {
  searchQuery: string;
  filterQuery: string[];
}

export const applyTxHistoryFilters = ({
  searchQuery,
  filterQuery,
  txns,
}: HistoryFilters & { txns: TransactionHistoryItem[] }) => {
  let filteredTxns: TransactionHistoryItem[];

  // Apply seach filter
  if (searchQuery.length > 0) {
    // txn may or may not contain reserve fields, there's definitely a way to handle this with generics but I'm lazy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredTxns = txns.filter((txn: any) => {
      const collateralSymbol = txn?.collateralReserve?.symbol?.toLowerCase(); // for liquidationcall
      const principalSymbol = txn?.principalReserve?.symbol?.toLowerCase(); // for liquidationcall
      const symbol = txn?.reserve?.symbol?.toLowerCase(); // for all other reserve actions
      if (
        (symbol && symbol.includes(searchQuery.toLowerCase())) ||
        (collateralSymbol && collateralSymbol.includes(searchQuery.toLowerCase())) ||
        (principalSymbol && principalSymbol.includes(searchQuery.toLowerCase()))
      ) {
        return true;
      } else {
        return false;
      }
    });
  } else {
    filteredTxns = txns;
  }

  // apply txn type filter
  if (filterQuery.length > 0) {
    filteredTxns = filteredTxns.filter((txn: TransactionHistoryItem) => {
      if (filterQuery.includes(txn.action)) {
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
  }: HistoryFilters): Promise<TransactionHistoryItem[]> => {
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
  }: UseInfiniteQueryResult<TransactionHistoryItem[], Error> = useInfiniteQuery(
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
        lastPage: TransactionHistoryItem[],
        allPages: TransactionHistoryItem[][]
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
