import { useState } from 'react';

import { UiStakeDataProvider } from '@aave/contract-helpers';
import { usePolling } from '../usePolling';
import { useApolloClient } from '@apollo/client';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import {
  C_StakeGeneralUiDataDocument,
  C_StakeGeneralUiDataQuery,
  C_StakeUserUiDataDocument,
  C_StakeUserUiDataQuery,
} from './graphql/hooks';
import { stakeConfig } from 'src/ui-config/stakeConfig';

export function _useStakeDataRPC(currentAccount?: string, skip = false) {
  const { cache } = useApolloClient();
  const [loading, setLoading] = useState(true);

  const loadStakeData = async () => {
    if (!stakeConfig) return;
    const uiStakeDataProvider = new UiStakeDataProvider({
      provider: getProvider(stakeConfig.chainId),
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
    });
    try {
      const generalStakeData = await uiStakeDataProvider.getGeneralStakeUIDataHumanized();
      cache.writeQuery<C_StakeGeneralUiDataQuery>({
        query: C_StakeGeneralUiDataDocument,
        data: {
          __typename: 'Query',
          stakeGeneralUIData: {
            __typename: 'StakeGeneralUIData',
            ...generalStakeData,
          },
        },
      });
      if (currentAccount) {
        const userStakeData = await uiStakeDataProvider.getUserStakeUIDataHumanized({
          user: currentAccount,
        });
        cache.writeQuery<C_StakeUserUiDataQuery>({
          query: C_StakeUserUiDataDocument,
          data: {
            __typename: 'Query',
            stakeUserUIData: {
              __typename: 'StakeUserUIData',
              ...userStakeData,
            },
          },
          variables: { userAddress: currentAccount },
        });
      }
    } catch (e) {
      console.log('Stake data loading error', e);
    }
    setLoading(false);
  };

  usePolling(loadStakeData, 30000, skip, [currentAccount]);

  return {
    loading,
    refresh: loadStakeData,
  };
}
