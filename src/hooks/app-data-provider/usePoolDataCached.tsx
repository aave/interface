import { useEffect } from 'react';
import { APOLLO_QUERY_TARGET } from 'src/utils/apolloClient';

import {
  C_ProtocolDataUpdateDocument,
  C_ProtocolDataUpdateSubscription,
  C_ProtocolDataUpdateSubscriptionVariables,
  C_UserDataUpdateDocument,
  C_UserDataUpdateSubscription,
  C_UserDataUpdateSubscriptionVariables,
  useC_ProtocolDataQuery,
  useC_UserDataQuery,
} from './graphql/hooks';

export function usePoolDataCached(
  lendingPoolAddressProvider: string,
  chainId: number,
  currentAccount?: string,
  skip = false
) {
  const { loading: poolDataLoading, subscribeToMore: subscribeToProtocolData } =
    useC_ProtocolDataQuery({
      variables: { lendingPoolAddressProvider },
      skip,
      context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
    });
  useEffect(() => {
    if (!skip) {
      return subscribeToProtocolData<
        C_ProtocolDataUpdateSubscription,
        C_ProtocolDataUpdateSubscriptionVariables
      >({
        document: C_ProtocolDataUpdateDocument,
        variables: { lendingPoolAddressProvider },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const protocolDataUpdate = subscriptionData.data?.protocolDataUpdate;

          if (!protocolDataUpdate) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            protocolData: protocolDataUpdate,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
      });
    }
  }, [subscribeToProtocolData, lendingPoolAddressProvider, skip]);

  const { loading: userDataLoading, subscribeToMore: subscribeToUserData } = useC_UserDataQuery({
    variables: { lendingPoolAddressProvider, userAddress: currentAccount || '' },
    skip: !currentAccount || skip,
    context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
  });
  useEffect(() => {
    if (currentAccount && !skip)
      return subscribeToUserData<
        C_UserDataUpdateSubscription,
        C_UserDataUpdateSubscriptionVariables
      >({
        document: C_UserDataUpdateDocument,
        variables: { lendingPoolAddressProvider, userAddress: currentAccount || '' },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const userData = subscriptionData.data?.userDataUpdate;
          if (!userData) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            userData,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.CHAIN(chainId) },
      });
  }, [subscribeToUserData, lendingPoolAddressProvider, currentAccount, skip]);

  const loading = (currentAccount && userDataLoading) || poolDataLoading;

  return {
    loading,
  };
}
