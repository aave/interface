import { useEffect } from 'react';
import { APOLLO_QUERY_TARGET } from 'src/utils/apolloClient';

import {
  C_PoolIncentivesDataUpdateDocument,
  C_PoolIncentivesDataUpdateSubscription,
  C_PoolIncentivesDataUpdateSubscriptionVariables,
  C_UserPoolIncentivesDataUpdateDocument,
  C_UserPoolIncentivesDataUpdateSubscription,
  C_UserPoolIncentivesDataUpdateSubscriptionVariables,
  ReserveIncentivesData,
  useC_ReservesIncentivesQuery,
  useC_UserIncentivesQuery,
  UserIncentivesData,
} from './graphql/hooks';

type IncentivesData = {
  userId?: string;
  reserveIncentiveData: ReserveIncentivesData[];
  userIncentiveData: UserIncentivesData[];
};
export interface PoolIncentivesWithCache {
  loading: boolean;
  data?: IncentivesData;
  error?: string;
}

export function useIncentivesDataCached(
  lendingPoolAddressProvider: string,
  chainId: number,
  marketName: string,
  currentAccount?: string,
  skip = false
): PoolIncentivesWithCache {
  const { loading: incentivesDataLoading, subscribeToMore: subscribeToIncentivesData } =
    useC_ReservesIncentivesQuery({
      variables: {
        lendingPoolAddressProvider,
        chainId,
      },
      skip,
      context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
    });

  // Reserve incentives
  useEffect(() => {
    if (!skip) {
      return subscribeToIncentivesData<
        C_PoolIncentivesDataUpdateSubscription,
        C_PoolIncentivesDataUpdateSubscriptionVariables
      >({
        document: C_PoolIncentivesDataUpdateDocument,
        variables: {
          lendingPoolAddressProvider,
          chainId,
        },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const poolIncentivesDataUpdate = subscriptionData.data?.poolIncentivesDataUpdate;

          if (!poolIncentivesDataUpdate) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            poolIncentivesData: poolIncentivesDataUpdate,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
      });
    }
  }, [subscribeToIncentivesData, lendingPoolAddressProvider, skip, chainId, marketName]);

  // User incentives
  const { loading: userIncentivesDataLoading, subscribeToMore: subscribeToUserIncentivesData } =
    useC_UserIncentivesQuery({
      variables: {
        lendingPoolAddressProvider,
        userAddress: currentAccount || '',
        chainId,
      },
      skip: !currentAccount || skip,
      context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
    });

  useEffect(() => {
    if (currentAccount && !skip)
      return subscribeToUserIncentivesData<
        C_UserPoolIncentivesDataUpdateSubscription,
        C_UserPoolIncentivesDataUpdateSubscriptionVariables
      >({
        document: C_UserPoolIncentivesDataUpdateDocument,
        variables: {
          lendingPoolAddressProvider,
          userAddress: currentAccount || '',
          chainId,
        },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const userData = subscriptionData.data?.userPoolIncentivesDataUpdate;
          if (!userData) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            userIncentives: userData,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
      });
  }, [
    subscribeToUserIncentivesData,
    lendingPoolAddressProvider,
    currentAccount,
    skip,
    chainId,
    marketName,
  ]);

  // logic
  const loading = (currentAccount && userIncentivesDataLoading) || incentivesDataLoading;

  return {
    loading,
  };
}
