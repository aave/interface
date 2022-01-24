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
  currentAccount?: string,
  skip = false
): PoolIncentivesWithCache {
  const { loading: incentivesDataLoading, subscribeToMore: subscribeToIncentivesData } =
    useC_ReservesIncentivesQuery({
      variables: {
        lendingPoolAddressProvider,
      },
      skip,
      context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
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
        context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
      });
    }
  }, [subscribeToIncentivesData, lendingPoolAddressProvider, skip]);

  // User incentives
  const { loading: userIncentivesDataLoading, subscribeToMore: subscribeToUserIncentivesData } =
    useC_UserIncentivesQuery({
      variables: {
        lendingPoolAddressProvider,
        userAddress: currentAccount || '',
      },
      skip: !currentAccount || skip,
      context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
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
        context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
      });
  }, [subscribeToUserIncentivesData, lendingPoolAddressProvider, currentAccount, skip]);

  // logic
  const loading = (currentAccount && userIncentivesDataLoading) || incentivesDataLoading;

  return {
    loading,
  };
}
