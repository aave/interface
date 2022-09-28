import { UiStakeDataProvider } from '@aave/contract-helpers';
import { useApolloClient } from '@apollo/client';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';
import {
  C_StakeGeneralUiDataDocument,
  C_StakeGeneralUiDataQuery,
  C_StakeUserUiDataDocument,
  C_StakeUserUiDataQuery,
} from './graphql/hooks';

export function _useStakeDataRPC(currentAccount: string, chainId: number, skip = false) {
  const { cache } = useApolloClient();
  const { currentNetworkConfig, jsonRpcProvider } = useProtocolDataContext();

  const isStakeFork =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig?.chainId;
  const rpcProvider = isStakeFork ? jsonRpcProvider : getProvider(stakeConfig.chainId);
  const uiStakeDataProvider = new UiStakeDataProvider({
    provider: rpcProvider,
    uiStakeDataProvider: stakeConfig.stakeDataProvider,
  });
  const loadGeneralStakeData = async () => {
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
    if (!currentAccount) return;
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
        variables: { userAddress: currentAccount, chainId },
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
