import { QueryClient } from '@tanstack/react-query';
import { findByChainId, MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';

import { SwapType } from '../../types';

export const invalidateAppStateForSwap = ({
  swapType,
  chainId,
  account,
  queryClient,
}: {
  swapType: SwapType;
  chainId: number;
  account: string;
  queryClient: QueryClient;
}) => {
  const marketDataType = findByChainId(chainId);

  if (!marketDataType) {
    return;
  }

  switch (swapType) {
    case SwapType.Swap:
      invalidateUserBalances({ account, queryClient, marketDataType });
      invalidateTransactionHistory({ account, queryClient, marketDataType });
      break;
    case SwapType.CollateralSwap:
      invalidateUserPoolBalances({ account, queryClient, marketDataType });
      invalidateTransactionHistory({ account, queryClient, marketDataType });
      break;
    case SwapType.DebtSwap:
      invalidateUserPoolBalances({ account, queryClient, marketDataType });
      invalidateTransactionHistory({ account, queryClient, marketDataType });
      break;
    case SwapType.RepayWithCollateral:
      invalidateUserPoolBalances({ account, queryClient, marketDataType });
      invalidateTransactionHistory({ account, queryClient, marketDataType });
      break;
    case SwapType.WithdrawAndSwap:
      invalidateUserBalances({ account, queryClient, marketDataType });
      invalidateUserPoolBalances({ account, queryClient, marketDataType });
      invalidateTransactionHistory({ account, queryClient, marketDataType });
      break;
  }
};

const invalidateUserBalances = ({
  account,
  queryClient,
  marketDataType,
}: {
  account: string;
  queryClient: QueryClient;
  marketDataType: MarketDataType;
}) => {
  queryClient.invalidateQueries({
    queryKey: queryKeysFactory.poolTokens(account, marketDataType),
  });
};

const invalidateUserPoolBalances = ({
  account,
  queryClient,
  marketDataType,
}: {
  account: string;
  queryClient: QueryClient;
  marketDataType: MarketDataType;
}) => {
  queryClient.invalidateQueries({
    queryKey: queryKeysFactory.userPoolReservesDataHumanized(account, marketDataType),
  });
};

const invalidateTransactionHistory = ({
  account,
  queryClient,
  marketDataType,
}: {
  account: string;
  queryClient: QueryClient;
  marketDataType: MarketDataType;
}) => {
  queryClient.invalidateQueries({
    queryKey: queryKeysFactory.transactionHistory(account, marketDataType),
  });
};
