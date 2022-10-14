import {
  IncentivesControllerInterface,
  IncentivesControllerV2Interface,
} from '@aave/contract-helpers';
import React, { useContext } from 'react';

export interface TxBuilderContextInterface {
  incentivesTxBuilder: IncentivesControllerInterface;
  incentivesTxBuilderV2: IncentivesControllerV2Interface;
}

export const TxBuilderContext = React.createContext({} as TxBuilderContextInterface);
export const useTxBuilderContext = () => useContext(TxBuilderContext);
