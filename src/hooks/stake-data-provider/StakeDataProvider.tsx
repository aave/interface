import React, { useContext } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useC_StakeGeneralUiDataQuery, useC_StakeUserUiDataQuery } from './graphql/hooks';
import { _useStakeDataCached } from './_useStakeDataCached';

interface StakeDataProviderContextType {}

const StakeDataProviderContext = React.createContext<StakeDataProviderContextType>(
  {} as StakeDataProviderContextType
);

/**
 * Naive provider that subscribes to different data sources to update the apollo cache.
 * @param param0
 * @returns
 */
export const StakeDataProvider: React.FC = ({ children }) => {
  _useStakeDataCached();
  return (
    <StakeDataProviderContext.Provider value={{}}>{children}</StakeDataProviderContext.Provider>
  );
};

/**
 * allows to manually refetch stake data
 * @returns
 */
export const useStakeDataProvider = () => useContext(StakeDataProviderContext);

/**
 * returns cached stake data from apollocache
 */
export const useStakeData = () => {
  const { currentAccount } = useWeb3Context();

  const { loading: stakeUserUIDataLoading, data: stakeUserResult } = useC_StakeUserUiDataQuery({
    variables: { userAddress: currentAccount },
    skip: !currentAccount,
    fetchPolicy: 'cache-only',
  });

  const { loading: stakeGeneralUIDataLoading, data: stakeGeneralResult } =
    useC_StakeGeneralUiDataQuery({ fetchPolicy: 'cache-only' });

  return {
    stakeUserResult,
    stakeGeneralResult,
    loading: stakeGeneralUIDataLoading || stakeUserUIDataLoading,
  };
};
