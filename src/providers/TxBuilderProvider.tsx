import { FaucetService, LendingPool, Pool, PoolInterface } from '@aave/contract-helpers';
import React, { ReactElement } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolData';
import { TxBuilderContext } from 'src/hooks/useTxBuilder';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export interface TxBuilderContextInterface {
  lendingPool: LendingPool | PoolInterface;
  faucetService: FaucetService;
}

export const TxBuilderProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { currentChainId, currentMarketData } = useProtocolDataContext();

  let lendingPool;
  if (!currentMarketData.v3) {
    lendingPool = new LendingPool(getProvider(currentChainId), {
      LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
      REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
      WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
    });
  } else {
    lendingPool = new Pool(getProvider(currentChainId), {
      POOL: currentMarketData.addresses.LENDING_POOL,
      REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
      WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
    });
  }
  const faucetService = new FaucetService(
    getProvider(currentChainId),
    currentMarketData.addresses.FAUCET
  );

  return (
    <TxBuilderContext.Provider value={{ lendingPool, faucetService }}>
      {children}
    </TxBuilderContext.Provider>
  );
};
