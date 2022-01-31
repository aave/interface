import { useEffect } from 'react';
import {
  C_StakeGeneralUiDataUpdateDocument,
  C_StakeGeneralUiDataUpdateSubscription,
  C_StakeUserUiDataUpdateDocument,
  C_StakeUserUiDataUpdateSubscription,
  C_StakeUserUiDataUpdateSubscriptionVariables,
  useC_StakeGeneralUiDataQuery,
  useC_StakeUserUiDataQuery,
} from './graphql/hooks';
import { APOLLO_QUERY_TARGET } from 'src/utils/apolloClient';

/**
 *
 * @param currentAccount
 * @param skip
 * @returns
 */
export function _useStakeDataCached(currentAccount?: string, skip = false) {
  const userId = currentAccount || '';
  const {
    loading: stakeGeneralUIDataLoading,
    data: stakeGeneralResult,
    subscribeToMore: subscribeToStakeGeneralUiData,
  } = useC_StakeGeneralUiDataQuery({ skip, context: { target: APOLLO_QUERY_TARGET.STAKE } });

  useEffect(() => {
    if (!skip) {
      return subscribeToStakeGeneralUiData<C_StakeGeneralUiDataUpdateSubscription>({
        document: C_StakeGeneralUiDataUpdateDocument,
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const stakeGeneralUIDataUpdate = subscriptionData.data?.stakeGeneralUIDataUpdate;

          if (!stakeGeneralUIDataUpdate) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            stakeGeneralUIData: stakeGeneralUIDataUpdate,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.STAKE },
      });
    }
  }, [subscribeToStakeGeneralUiData]);

  const {
    loading: stakeUserUIDataLoading,
    data: stakeUserResult,
    subscribeToMore: subscribeToStakeUserUiData,
  } = useC_StakeUserUiDataQuery({
    variables: { userAddress: userId },
    skip: !userId || skip,
    context: { target: APOLLO_QUERY_TARGET.STAKE },
  });

  useEffect(() => {
    if (userId && !skip) {
      return subscribeToStakeUserUiData<
        C_StakeUserUiDataUpdateSubscription,
        C_StakeUserUiDataUpdateSubscriptionVariables
      >({
        document: C_StakeUserUiDataUpdateDocument,
        variables: { userAddress: userId },
        updateQuery: (previousQueryResult, { subscriptionData }) => {
          const stakeUserUIDataUpdate = subscriptionData.data?.stakeUserUIDataUpdate;
          if (!stakeUserUIDataUpdate) {
            return previousQueryResult;
          }
          return {
            ...previousQueryResult,
            stakeUserUIData: stakeUserUIDataUpdate,
          };
        },
        context: { target: APOLLO_QUERY_TARGET.STAKE },
      });
    }
  }, [subscribeToStakeUserUiData, userId]);

  const loading = (userId && stakeUserUIDataLoading) || stakeGeneralUIDataLoading;

  const stakeGeneralData = stakeGeneralResult?.stakeGeneralUIData || undefined;
  if (!stakeGeneralData || (!stakeUserResult?.stakeUserUIData && !stakeUserUIDataLoading)) {
    return {
      loading,
      data: undefined,
      usdPriceEth: undefined,
    };
  }
  const usdPriceEth = stakeGeneralData?.usdPriceEth;

  return {
    loading,
    data: {
      aave: { ...stakeGeneralData.aave, ...stakeUserResult?.stakeUserUIData.aave },
      bpt: { ...stakeGeneralData.bpt, ...stakeUserResult?.stakeUserUIData.bpt },
    },
    usdPriceEth,
  };
}
