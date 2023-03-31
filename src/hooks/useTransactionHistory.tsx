import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { USER_TRANSACTIONS_V2 } from 'src/modules/history/v2-user-history-query';
import { USER_TRANSACTIONS_V3 } from 'src/modules/history/v3-user-history-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';

export type TransactionHistoryItem = {
  id: string;
  txHash: string;
  action: string;
  pool: {
    id: string;
  };
  timestamp: number;
};

export const useTransactionHistory = () => {
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

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  };
};
