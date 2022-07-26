import {
  FaucetService,
  IncentivesControllerInterface,
  IncentivesControllerV2Interface,
  LendingPool,
  PoolInterface,
  IAaveBiconomyForwarderServiceInterface
} from '@aave/contract-helpers';
import React, { useContext } from 'react';

export interface TxBuilderContextInterface {

  BiconomyProxy?: IAaveBiconomyForwarderServiceInterface;
  lendingPool: LendingPool | PoolInterface;
  faucetService: FaucetService;
  incentivesTxBuilder: IncentivesControllerInterface;
  incentivesTxBuilderV2: IncentivesControllerV2Interface;
}

export const TxBuilderContext = React.createContext({} as TxBuilderContextInterface);
export const useTxBuilderContext = () => useContext(TxBuilderContext);
