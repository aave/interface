import {
  ChainId,
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { usePolling } from '../usePolling';
import {
  C_ProtocolDataDocument,
  C_ProtocolDataQuery,
  C_UserDataDocument,
  C_UserDataQuery,
} from './graphql/hooks';

// interval in which the rpc data is refreshed
const POLLING_INTERVAL = 30 * 1000;

export interface PoolDataResponse {
  loading: boolean;
  error: boolean;
  data: {
    reserves?: ReservesDataHumanized;
    userReserves?: UserReserveDataHumanized[];
    userEmodeCategoryId?: number;
  };
  refresh: () => Promise<void[]>;
}

// Fetch reserve and user incentive data from UiIncentiveDataProvider
export function usePoolDataRPC(
  lendingPoolAddressProvider: string,
  chainId: ChainId,
  poolDataProviderAddress: string,
  skip: boolean,
  currentAccount?: string
) {
  console.log('rpc skip: ', skip);
  const { cache } = useApolloClient();
  const [loadingReserves, setLoadingReserves] = useState<boolean>(true);
  const [errorReserves, setErrorReserves] = useState<boolean>(false);
  const [loadingUserReserves, setLoadingUserReserves] = useState<boolean>(false);
  const [errorUserReserves, setErrorUserReserves] = useState<boolean>(false);

  // Fetch and format reserve incentive data from UiIncentiveDataProvider contract
  const fetchReserves = async () => {
    const provider = getProvider(chainId);

    try {
      setLoadingReserves(true);
      const poolDataProviderContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: poolDataProviderAddress,
        provider,
        chainId,
      });
      const reservesResponse = await poolDataProviderContract.getReservesHumanized({
        lendingPoolAddressProvider,
      });
      cache.writeQuery<C_ProtocolDataQuery>({
        query: C_ProtocolDataDocument,
        data: {
          __typename: 'Query',
          protocolData: {
            __typename: 'ProtocolData',
            baseCurrencyData: {
              ...reservesResponse.baseCurrencyData,
              __typename: 'BaseCurrencyData',
            },
            reserves: reservesResponse.reservesData.map((reserve) => ({
              ...reserve,
              __typename: 'ReserveData',
            })),
          },
        },
        variables: { lendingPoolAddressProvider, chainId },
      });
      setErrorReserves(false);
    } catch (e) {
      console.log('e', e);
      setErrorReserves(e.message);
    }
    setLoadingReserves(false);
  };

  // Fetch and format user incentive data from UiIncentiveDataProvider
  const fetchUserReserves = async () => {
    if (!currentAccount) return;
    const provider = getProvider(chainId);

    try {
      const poolDataProviderContract = new UiPoolDataProvider({
        uiPoolDataProviderAddress: poolDataProviderAddress,
        provider,
        chainId,
      });
      setLoadingUserReserves(true);

      const userReservesResponse = await poolDataProviderContract.getUserReservesHumanized({
        lendingPoolAddressProvider,
        user: currentAccount,
      });

      cache.writeQuery<C_UserDataQuery>({
        query: C_UserDataDocument,
        data: {
          __typename: 'Query',
          userData: {
            __typename: 'UserReservesData',
            userReserves: userReservesResponse.userReserves.map((reserve) => ({
              ...reserve,
              __typename: 'UserReserveData',
            })),
            userEmodeCategoryId: userReservesResponse.userEmodeCategoryId,
          },
        },
        variables: { lendingPoolAddressProvider, userAddress: currentAccount, chainId },
      });

      setErrorUserReserves(false);
    } catch (e) {
      console.log('e', e);
      setErrorUserReserves(e.message);
    }
    setLoadingUserReserves(false);
  };

  usePolling(fetchReserves, POLLING_INTERVAL, skip, [skip, poolDataProviderAddress, chainId]);
  usePolling(fetchUserReserves, POLLING_INTERVAL, skip, [
    skip,
    poolDataProviderAddress,
    chainId,
    currentAccount,
  ]);

  const loading = loadingReserves || loadingUserReserves;
  const error = errorReserves || errorUserReserves;
  return {
    loading,
    error,
    refresh: () => {
      return Promise.all([fetchUserReserves(), fetchReserves()]);
    },
  };
}
