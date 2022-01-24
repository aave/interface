import { FaucetService, LendingPool, PoolInterface } from '@aave/contract-helpers';
import React, { useContext } from 'react';

export interface TxBuilderContextInterface {
  lendingPool: LendingPool | PoolInterface;
  faucetService: FaucetService;
}

export const TxBuilderContext = React.createContext({} as TxBuilderContextInterface);
export const useTxBuilderContext = () => useContext(TxBuilderContext);
