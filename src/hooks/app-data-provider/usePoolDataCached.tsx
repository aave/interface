import { useEffect } from 'react';
import { APOLLO_QUERY_TARGET } from 'src/utils/apolloClient';
import { useModalContext } from '../useModal';

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
  marketName: string,
  currentAccount?: string,
  skip = false
) {
  const { mainTxState } = useModalContext();
  console.log('cache skip::::: ', skip, 'current account: ', currentAccount);
  const { loading: poolDataLoading, subscribeToMore: subscribeToProtocolData } =
    useC_ProtocolDataQuery({
      variables: { lendingPoolAddressProvider, chainId },
      skip,
      context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
    });
  useEffect(() => {
    if (!skip) {
      return subscribeToProtocolData<
        C_ProtocolDataUpdateSubscription,
        C_ProtocolDataUpdateSubscriptionVariables
      >({
        document: C_ProtocolDataUpdateDocument,
        variables: { lendingPoolAddressProvider, chainId },
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
        context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
      });
    }
  }, [subscribeToProtocolData, lendingPoolAddressProvider, skip, chainId, marketName]);

  const {
    loading: userDataLoading,
    subscribeToMore: subscribeToUserData,
    data,
  } = useC_UserDataQuery({
    variables: { lendingPoolAddressProvider, userAddress: currentAccount || '', chainId },
    skip: !currentAccount || skip,
    context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
  });

  console.log('data: ', data);

  useEffect(() => {
    console.log(
      'loading:::: ',
      mainTxState.loading,
      ' | is it true? ::: ',
      mainTxState.loading !== true
    );
    console.log(
      'currentAccount && !skip ::: ',
      currentAccount && !skip && mainTxState.loading !== true
    );
    if (currentAccount && !skip && mainTxState.loading !== true) {
      console.log('=============');
      return subscribeToUserData<
        C_UserDataUpdateSubscription,
        C_UserDataUpdateSubscriptionVariables
      >({
        document: C_UserDataUpdateDocument,
        variables: { lendingPoolAddressProvider, userAddress: currentAccount || '', chainId },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const userData = subscriptionData.data?.userDataUpdate;
          console.log('user data: ', userData);
          if (!userData) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            userData,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.MARKET(marketName) },
      });
    }
  }, [
    subscribeToUserData,
    lendingPoolAddressProvider,
    currentAccount,
    skip,
    chainId,
    marketName,
    mainTxState,
  ]);

  const loading = (currentAccount && userDataLoading) || poolDataLoading;

  return {
    loading,
  };
}
