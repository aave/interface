import {
  IncentivesController,
  IncentivesControllerInterface,
  IncentivesControllerV2,
  IncentivesControllerV2Interface,
} from '@aave/contract-helpers';
import React, { ReactElement } from 'react';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { TxBuilderContext } from 'src/hooks/useTxBuilder';

export interface TxBuilderContextInterface {
  incentivesTxBuilder: IncentivesControllerInterface;
  incentivesTxBuilderV2: IncentivesControllerV2Interface;
}

export const TxBuilderProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const { jsonRpcProvider } = useProtocolDataContext();

  const incentivesTxBuilder: IncentivesControllerInterface = new IncentivesController(
    jsonRpcProvider()
  );
  const incentivesTxBuilderV2: IncentivesControllerV2Interface = new IncentivesControllerV2(
    jsonRpcProvider()
  );

  return (
    <TxBuilderContext.Provider value={{ incentivesTxBuilder, incentivesTxBuilderV2 }}>
      {children}
    </TxBuilderContext.Provider>
  );
};
