import {
  C_ReservesIncentivesDocument,
  C_ReservesIncentivesQuery,
  C_UserIncentivesDocument,
  C_UserIncentivesQuery,
} from './graphql/hooks';
import {
  ChainId,
  ReservesIncentiveDataHumanized,
  UiIncentiveDataProvider,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers';

import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { useApolloClient } from '@apollo/client';
import { usePolling } from '../usePolling';
import { useState } from 'react';

// interval in which the rpc data is refreshed
const POOLING_INTERVAL = 30 * 1000;
// decreased interval in case there was a network error for faster recovery
const RECOVER_INTERVAL = 10 * 1000;

export interface IncentiveDataResponse {
  loading: boolean;
  error: boolean;
  data: {
    reserveIncentiveData?: ReservesIncentiveDataHumanized[];
    userIncentiveData?: UserReservesIncentivesDataHumanized[];
  };
  refresh: () => Promise<void>;
}

// Fetch reserve and user incentive data from UiIncentiveDataProvider
export function useIncentivesDataRPC(
  lendingPoolAddressProvider: string,
  chainId: ChainId,
  incentiveDataProviderAddress: string | undefined,
  skip: boolean,
  currentAccount?: string
) {
  const { cache } = useApolloClient();
  const [loadingReserveIncentives, setLoadingReserveIncentives] = useState<boolean>(false);
  const [errorReserveIncentives, setErrorReserveIncentives] = useState<boolean>(false);
  const [loadingUserIncentives, setLoadingUserIncentives] = useState<boolean>(false);
  const [errorUserIncentives, setErrorUserIncentives] = useState<boolean>(false);

  // Fetch and format reserve incentive data from UiIncentiveDataProvider contract
  const fetchReserveIncentiveData = async () => {
    setLoadingReserveIncentives(true);
    const provider = getProvider(chainId);
    const incentiveDataProviderContract = new UiIncentiveDataProvider({
      provider,
      uiIncentiveDataProviderAddress: incentiveDataProviderAddress!,
    });

    try {
      const rawReserveIncentiveData =
        await incentiveDataProviderContract.getReservesIncentivesDataHumanized(
          lendingPoolAddressProvider
        );
      cache.writeQuery<C_ReservesIncentivesQuery>({
        query: C_ReservesIncentivesDocument,
        data: {
          __typename: 'Query',
          reservesIncentives: rawReserveIncentiveData.map((incentive) => ({
            ...incentive,
            aIncentiveData: { ...incentive.aIncentiveData, __typename: 'IncentiveData' },
            vIncentiveData: { ...incentive.vIncentiveData, __typename: 'IncentiveData' },
            sIncentiveData: { ...incentive.sIncentiveData, __typename: 'IncentiveData' },
            __typename: 'ReserveIncentivesData',
          })),
        },
        variables: { lendingPoolAddressProvider },
      });
      setErrorReserveIncentives(false);
    } catch (e) {
      console.log('e', e);
      setErrorReserveIncentives(e.message);
    }
    setLoadingReserveIncentives(false);
  };

  // Fetch and format user incentive data from UiIncentiveDataProvider
  const fetchUserIncentiveData = async () => {
    setLoadingUserIncentives(true);
    const provider = getProvider(chainId);
    const incentiveDataProviderContract = new UiIncentiveDataProvider({
      uiIncentiveDataProviderAddress: incentiveDataProviderAddress!,
      provider,
    });

    try {
      const rawUserIncentiveData: UserReservesIncentivesDataHumanized[] =
        await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
          user: currentAccount!,
          lendingPoolAddressProvider,
        });
      cache.writeQuery<C_UserIncentivesQuery>({
        query: C_UserIncentivesDocument,
        data: {
          __typename: 'Query',
          userIncentives: rawUserIncentiveData.map((userIncentive) => ({
            ...userIncentive,
            aTokenIncentivesUserData: {
              ...userIncentive.aTokenIncentivesUserData,
              __typename: 'UserIncentiveData',
            },
            vTokenIncentivesUserData: {
              ...userIncentive.vTokenIncentivesUserData,
              __typename: 'UserIncentiveData',
            },
            sTokenIncentivesUserData: {
              ...userIncentive.sTokenIncentivesUserData,
              __typename: 'UserIncentiveData',
            },
            __typename: 'UserIncentivesData',
          })),
        },
        variables: { lendingPoolAddressProvider, userAddress: currentAccount },
      });
      setErrorUserIncentives(false);
    } catch (e) {
      console.log('e', e);
      setErrorUserIncentives(e.message);
    }
    setLoadingUserIncentives(false);
  };

  usePolling(
    fetchReserveIncentiveData,
    errorReserveIncentives || errorUserIncentives ? RECOVER_INTERVAL : POOLING_INTERVAL,
    skip || !incentiveDataProviderAddress,
    [lendingPoolAddressProvider, incentiveDataProviderAddress]
  );

  usePolling(
    fetchUserIncentiveData,
    errorReserveIncentives || errorUserIncentives ? RECOVER_INTERVAL : POOLING_INTERVAL,
    skip || !currentAccount || !incentiveDataProviderAddress,
    [lendingPoolAddressProvider, incentiveDataProviderAddress, currentAccount]
  );

  const loading = loadingReserveIncentives || loadingUserIncentives;
  const error = errorReserveIncentives || errorUserIncentives;
  return {
    loading,
    error,
    refresh: async () => {
      if (incentiveDataProviderAddress) {
        if (currentAccount) await fetchUserIncentiveData();
        await fetchReserveIncentiveData();
      }
    },
  };
}
