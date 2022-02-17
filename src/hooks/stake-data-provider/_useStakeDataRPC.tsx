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
import { getStakeConfig } from 'src/ui-config/stakeConfig';

export function _useStakeDataRPC(currentAccount?: string, skip = false) {
  const { cache } = useApolloClient();
  const stakeConfig = getStakeConfig();

  const loadGeneralStakeData = async () => {
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
    } catch (e) {
      console.log('Stake general data loading error', e);
    }
  };

  const loadUserStakeData = async () => {
    const stakeConfig = getStakeConfig();
    if (!stakeConfig || !currentAccount) return;
    const uiStakeDataProvider = new UiStakeDataProvider({
      provider: getProvider(stakeConfig.chainId),
      uiStakeDataProvider: stakeConfig.stakeDataProvider,
    });
    try {
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
    } catch (e) {
      console.log('Stake user data user loading error', e);
    }
  };

  usePolling(loadGeneralStakeData, 30000, skip, []);
  usePolling(loadUserStakeData, 30000, skip || !currentAccount, [currentAccount]);

  return {
    refresh: () => Promise.all([loadGeneralStakeData(), loadUserStakeData()]),
  };
}
