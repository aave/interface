import { useState } from "react";
import { SupplyState } from "./Supply";


export type SupplyActionProps = {
  setSupplyStep: (step: SupplyState) => void;
  supplyStep: SupplyState,
  amountToSupply: number,
}

export const SupplyActions = ({
  setSupplyStep,
  supplyStep,
  amountToSupply,
}: SupplyActionProps) => {
  const [txData, setTxData] = useState<EthereumTransactionTypeExtended[]>();
  
  
  switch(supplyStep) {
    case SupplyState.amountInput:
      return ();
    case SupplyState.approval:
      return ();
    case SupplyState.sendTx:
      return ();
    case SupplyState.success:
      return ();
    case SupplyState.error:
      return ();
  }
}