import { WalletBalanceProvider } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import React, { useContext } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';

type WalletBalanceProviderContext = {
  aaveTokens: { aave: string; aAave: string; stkAave: string };
  loading: boolean;
};

const Context = React.createContext<WalletBalanceProviderContext>(
  {} as WalletBalanceProviderContext
);

/**
 * This is required for token delegation, as we need to know the users balance.
 */
export const AaveTokensBalanceProvider: React.FC = ({ children }) => {
  const { currentNetworkConfig, jsonRpcProvider, currentChainId } = useProtocolDataContext();
  const { currentAccount: walletAddress } = useWeb3Context();
  const [aaveTokens, setAaveTokens] = React.useState({
    aave: '0',
    aAave: '0',
    stkAave: '0',
  });
  const [aaveTokensLoading, setAaveTokensLoading] = React.useState(false);

  const isGovernanceFork =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId;
  const rpcProvider = isGovernanceFork ? jsonRpcProvider() : getProvider(governanceConfig.chainId);

  const fetchAaveTokenBalances = async () => {
    setAaveTokensLoading(true);
    try {
      const contract = new WalletBalanceProvider({
        walletBalanceProviderAddress: governanceConfig.walletBalanceProvider,
        provider: rpcProvider,
      });
      const balances = await contract.batchBalanceOf(
        [walletAddress],
        [
          governanceConfig.aaveTokenAddress,
          governanceConfig.aAaveTokenAddress,
          governanceConfig.stkAaveTokenAddress,
        ]
      );
      setAaveTokens({
        aave: normalize(balances[0].toString(), 18),
        aAave: normalize(balances[1].toString(), 18),
        stkAave: normalize(balances[2].toString(), 18),
      });
    } catch (e) {
      console.log(e);
    }
    setAaveTokensLoading(false);
  };

  usePolling(fetchAaveTokenBalances, 60000, !walletAddress || !governanceConfig, [
    walletAddress,
    currentChainId,
  ]);

  return (
    <Context.Provider
      value={{
        aaveTokens,
        loading: aaveTokensLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useAaveTokensProviderContext = () => useContext(Context);
