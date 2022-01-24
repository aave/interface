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
import { C_ProtocolDataDocument, C_ProtocolDataQuery, C_UserDataQuery } from './graphql/hooks';

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
  const { cache } = useApolloClient();
  const [loadingReserves, setLoadingReserves] = useState<boolean>(true);
  const [errorReserves, setErrorReserves] = useState<boolean>(false);
  const [loadingUserReserves, setLoadingUserReserves] = useState<boolean>(false);
  const [errorUserReserves, setErrorUserReserves] = useState<boolean>(false);

  // Fetch and format reserve incentive data from UiIncentiveDataProvider contract
  const fetchReserves = async () => {
    const provider = getProvider(chainId);
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: poolDataProviderAddress,
      provider,
    });

    try {
      setLoadingReserves(true);
      const reservesResponse = await poolDataProviderContract.getReservesHumanized(
        lendingPoolAddressProvider
      );
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
        variables: { lendingPoolAddressProvider },
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
    const poolDataProviderContract = new UiPoolDataProvider({
      uiPoolDataProviderAddress: poolDataProviderAddress,
      provider,
    });

    try {
      setLoadingUserReserves(true);
      const userReservesResponse = await poolDataProviderContract.getUserReservesHumanized(
        lendingPoolAddressProvider,
        currentAccount
      );
      cache.writeQuery<C_UserDataQuery>({
        query: C_ProtocolDataDocument,
        data: {
          __typename: 'Query',
          userData: userReservesResponse,
        },
        variables: { lendingPoolAddressProvider, userAddress: currentAccount },
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
