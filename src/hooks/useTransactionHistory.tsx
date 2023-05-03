import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { USER_TRANSACTIONS_V2 } from 'src/modules/history/v2-user-history-query';
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

export const useTransactionHistory = ({ fetchAll }: { fetchAll: boolean }) => {
  const { currentMarketData, account } = useRootStore();

  interface TransactionHistoryParams {
    account: string;
    subgraphUrl: string;
    first: number;
    skip: number;
    v3: boolean;
  }
  const fetchTransactionHistory = async ({
    account,
    subgraphUrl,
    first,
    skip,
    v3,
  }: TransactionHistoryParams) => {
    const requestBody = {
      query: v3 ? USER_TRANSACTIONS_V3 : USER_TRANSACTIONS_V2,
      variables: { userAddress: account, first, skip },
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

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
  }: UseInfiniteQueryResult<TransactionHistoryItem[], Error> = useInfiniteQuery(
    [QueryKeys.TRANSACTION_HISTORY, account, currentMarketData.subgraphUrl],
    async ({ pageParam = 0 }) => {
      const response = await fetchTransactionHistory({
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        first: 100,
        skip: pageParam,
        v3: !!currentMarketData.v3,
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
          return false;
        }
        return allPages.length * 100;
      },
    }
  );

  // If fetchAll is true, fetch all pages immediately instead of waiting for page trigger
  useEffect(() => {
    if (fetchAll && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchAll, hasNextPage, fetchNextPage]);

  return {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  };
};
