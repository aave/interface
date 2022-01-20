import {
  C_PoolIncentivesDataUpdateDocument,
  C_PoolIncentivesDataUpdateSubscription,
  C_PoolIncentivesDataUpdateSubscriptionVariables,
  C_UserPoolIncentivesDataUpdateDocument,
  C_UserPoolIncentivesDataUpdateSubscription,
  C_UserPoolIncentivesDataUpdateSubscriptionVariables,
  ReserveIncentivesData,
  UserIncentivesData,
  useC_ReservesIncentivesQuery,
  useC_UserIncentivesQuery,
} from './graphql/hooks';

import { APOLLO_QUERY_TARGET } from 'src/utils/apolloClient';
import { useEffect } from 'react';

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
  const userId = currentAccount?.toLowerCase() || undefined;
  const {
    loading: incentivesDataLoading,
    data: incentivesData,
    subscribeToMore: subscribeToIncentivesData,
  } = useC_ReservesIncentivesQuery({
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
  const {
    loading: userIncentivesDataLoading,
    data: userIncentivesData,
    subscribeToMore: subscribeToUserIncentivesData,
  } = useC_UserIncentivesQuery({
    variables: {
      lendingPoolAddressProvider,
      userAddress: userId || '',
    },
    skip: !userId || skip,
    context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
  });

  useEffect(() => {
    if (userId && !skip)
      return subscribeToUserIncentivesData<
        C_UserPoolIncentivesDataUpdateSubscription,
        C_UserPoolIncentivesDataUpdateSubscriptionVariables
      >({
        document: C_UserPoolIncentivesDataUpdateDocument,
        variables: {
          lendingPoolAddressProvider,
          userAddress: userId || '',
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
  }, [subscribeToUserIncentivesData, lendingPoolAddressProvider, userId, skip]);

  // logic
  const loading = (userId && userIncentivesDataLoading) || incentivesDataLoading;
  const reserveIncentiveData: ReserveIncentivesData[] = incentivesData?.reservesIncentives || [];
  const userIncentiveData: UserIncentivesData[] = userIncentivesData?.userIncentives || [];

  return {
    loading,
    data: {
      userId,
      reserveIncentiveData,
      userIncentiveData,
    },
  };
}
