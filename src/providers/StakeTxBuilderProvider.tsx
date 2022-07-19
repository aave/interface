import { StakingService } from '@aave/contract-helpers';
import React, { ReactElement } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { stakeConfig } from 'src/ui-config/stakeConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export interface StakeTxBuilderContextInterface {
  stakingServices: Record<string, StakingService>;
}
export const StakeTxBuilderContext = React.createContext({} as StakeTxBuilderContextInterface);

export const StakeTxBuilderProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { jsonRpcProvider, currentNetworkConfig } = useProtocolDataContext();

  const isStakeFork =
    currentNetworkConfig.isFork && currentNetworkConfig.underlyingChainId === stakeConfig.chainId;
  const rpcProvider = isStakeFork ? jsonRpcProvider() : getProvider(stakeConfig.chainId);

  const stakingServices: Record<string, StakingService> = {};

  Object.keys(stakeConfig.tokens).forEach((tokenName) => {
    const service = new StakingService(rpcProvider, {
      TOKEN_STAKING_ADDRESS: stakeConfig.tokens[tokenName].TOKEN_STAKING,
    });

    stakingServices[tokenName] = service;
  });

  return (
    <StakeTxBuilderContext.Provider value={{ stakingServices }}>
      {children}
    </StakeTxBuilderContext.Provider>
  );
};
