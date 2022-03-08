import React, { useContext } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getStakeConfig } from 'src/ui-config/stakeConfig';

import { useConnectionStatusContext } from '../useConnectionStatusContext';
import { _useStakeDataCached } from './_useStakeDataCached';
import { _useStakeDataRPC } from './_useStakeDataRPC';
import { useC_StakeGeneralUiDataQuery, useC_StakeUserUiDataQuery } from './graphql/hooks';

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
  const stakeConfig = getStakeConfig();
  const { currentAccount } = useWeb3Context();
  const { isRPCActive } = useConnectionStatusContext();

  const rpcMode = isRPCActive || !stakeConfig?.wsStakeDataUrl || !stakeConfig?.queryStakeDataUrl;

  _useStakeDataCached(currentAccount, rpcMode);
  const { refresh } = _useStakeDataRPC(currentAccount, !rpcMode);
  return (
    <StakeDataProviderContext.Provider value={{ refresh }}>
      {children}
    </StakeDataProviderContext.Provider>
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

  const { data: stakeUserResult } = useC_StakeUserUiDataQuery({
    variables: { userAddress: currentAccount },
    skip: !currentAccount,
    fetchPolicy: 'cache-only',
  });

  const { data: stakeGeneralResult } = useC_StakeGeneralUiDataQuery({ fetchPolicy: 'cache-only' });

  return {
    stakeUserResult,
    stakeGeneralResult,
    loading: !stakeGeneralResult || (!!currentAccount && !stakeUserResult),
  };
};
