import { UiStakeDataProvider } from '@aave/contract-helpers';
import { usePolling } from '../usePolling';
import { useApolloClient } from '@apollo/client';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { C_StakeUserUiDataDocument, C_StakeUserUiDataQuery } from './graphql/hooks';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { useProtocolDataContext } from '../useProtocolDataContext';

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

  usePolling(loadUserStakeData, 30000, skip || !currentAccount, [currentAccount]);

  return {
    refresh: () => Promise.all([loadUserStakeData()]),
  };
}
