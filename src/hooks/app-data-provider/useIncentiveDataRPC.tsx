import {
  ChainId,
  ReservesIncentiveDataHumanized,
  UiIncentiveDataProvider,
  UserReservesIncentivesDataHumanized,
} from '@aave/contract-helpers';

import { getProvider } from 'src/utils/marketsAndNetworksConfig';
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
  userAddress?: string
): IncentiveDataResponse {
  const currentAccount: string | undefined = userAddress ? userAddress.toLowerCase() : undefined;
  const [loadingReserveIncentives, setLoadingReserveIncentives] = useState<boolean>(false);
  const [errorReserveIncentives, setErrorReserveIncentives] = useState<boolean>(false);
  const [loadingUserIncentives, setLoadingUserIncentives] = useState<boolean>(false);
  const [errorUserIncentives, setErrorUserIncentives] = useState<boolean>(false);
  const [reserveIncentiveData, setReserveIncentiveData] = useState<
    ReservesIncentiveDataHumanized[] | undefined
  >(undefined);
  const [userIncentiveData, setUserIncentiveData] = useState<
    UserReservesIncentivesDataHumanized[] | undefined
  >(undefined);

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
      setReserveIncentiveData(rawReserveIncentiveData);
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

      setUserIncentiveData(rawUserIncentiveData);
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
    data: { reserveIncentiveData, userIncentiveData },
    refresh: async () => {
      if (incentiveDataProviderAddress) {
        if (currentAccount) await fetchUserIncentiveData();
        await fetchReserveIncentiveData();
      }
    },
  };
}
