import {
  ChainId,
  ReservesIncentiveDataHumanized,
  UiIncentiveDataProvider,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers';
import { useApolloClient } from '@apollo/client';
import { useState } from 'react';

import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';
import {
  C_ReservesIncentivesDocument,
  C_ReservesIncentivesQuery,
  C_UserIncentivesDocument,
  C_UserIncentivesQuery,
} from './graphql/hooks';

// interval in which the rpc data is refreshed
const POOLING_INTERVAL = 30 * 1000;

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
  const { jsonRpcProvider: provider } = useProtocolDataContext();

  // Fetch and format reserve incentive data from UiIncentiveDataProvider contract
  const fetchReserveIncentiveData = async () => {
    if (!incentiveDataProviderAddress || !provider) return;
    setLoadingReserveIncentives(true);
    // const provider = getProvider(chainId);

    try {
      const incentiveDataProviderContract = new UiIncentiveDataProvider({
        provider,
        uiIncentiveDataProviderAddress: incentiveDataProviderAddress,
        chainId,
      });
      const rawReserveIncentiveData =
        await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
          lendingPoolAddressProvider,
        });
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
        variables: { lendingPoolAddressProvider, chainId },
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
    if (!incentiveDataProviderAddress || !currentAccount) return;
    setLoadingUserIncentives(true);
    // const provider = getProvider(chainId);

    try {
      const incentiveDataProviderContract = new UiIncentiveDataProvider({
        uiIncentiveDataProviderAddress: incentiveDataProviderAddress,
        provider,
        chainId,
      });
      const rawUserIncentiveData: UserReservesIncentivesDataHumanized[] =
        await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
          user: currentAccount,
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
        variables: { lendingPoolAddressProvider, userAddress: currentAccount, chainId },
      });
      setErrorUserIncentives(false);
    } catch (e) {
      console.log('e', e);
      setErrorUserIncentives(e.message);
    }
    setLoadingUserIncentives(false);
  };

  usePolling(fetchReserveIncentiveData, POOLING_INTERVAL, skip || !incentiveDataProviderAddress, [
    provider,
    lendingPoolAddressProvider,
    incentiveDataProviderAddress,
  ]);

  usePolling(
    fetchUserIncentiveData,
    POOLING_INTERVAL,
    skip || !currentAccount || !incentiveDataProviderAddress,
    [provider, lendingPoolAddressProvider, incentiveDataProviderAddress, currentAccount]
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
