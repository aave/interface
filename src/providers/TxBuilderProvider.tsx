import {
  FaucetService,
  IncentivesController,
  IncentivesControllerInterface,
  IncentivesControllerV2,
  IncentivesControllerV2Interface,
  LendingPool,
  Pool,
  PoolInterface,
} from '@aave/contract-helpers';
import React, { ReactElement } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { TxBuilderContext } from 'src/hooks/useTxBuilder';

export interface TxBuilderContextInterface {
  lendingPool: LendingPool | PoolInterface;
  faucetService: FaucetService;
  incentivesTxBuilder: IncentivesControllerInterface;
  incentivesTxBuilderV2: IncentivesControllerV2Interface;
}

export const TxBuilderProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { currentMarketData, jsonRpcProvider } = useProtocolDataContext();

  let lendingPool;
  if (!currentMarketData.v3) {
    lendingPool = new LendingPool(jsonRpcProvider, {
      LENDING_POOL: currentMarketData.addresses.LENDING_POOL,
      REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
      WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
    });
  } else {
    lendingPool = new Pool(jsonRpcProvider, {
      POOL: currentMarketData.addresses.LENDING_POOL,
      REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
      WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
    });
  }

  const faucetService = new FaucetService(jsonRpcProvider, currentMarketData.addresses.FAUCET);

  const incentivesTxBuilder: IncentivesControllerInterface = new IncentivesController(
    jsonRpcProvider
  );
  const incentivesTxBuilderV2: IncentivesControllerV2Interface = new IncentivesControllerV2(
    jsonRpcProvider
  );

  return (
    <TxBuilderContext.Provider
      value={{ lendingPool, faucetService, incentivesTxBuilder, incentivesTxBuilderV2 }}
    >
      {children}
    </TxBuilderContext.Provider>
  );
};
