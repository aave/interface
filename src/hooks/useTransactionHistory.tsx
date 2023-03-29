import { useQuery } from '@tanstack/react-query';
import { USER_TRANSACTIONS_V2 } from 'src/modules/history/v2-user-history-query';
import { USER_TRANSACTIONS_V3 } from 'src/modules/history/v3-user-history-query';
import { useRootStore } from 'src/store/root';
import { QueryKeys } from 'src/ui-config/queries';

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

  return useQuery({
    queryFn: () =>
      fetchTransactionHistory({
        account,
        subgraphUrl: currentMarketData.subgraphUrl ?? '',
        first: 100,
        skip: 0,
        v3: !!currentMarketData.v3,
      }),
    queryKey: [QueryKeys.TRANSACTION_HISTORY, account, currentMarketData.subgraphUrl],
    enabled: !!account && !!currentMarketData.subgraphUrl,
    initialData: [],
  });
};
