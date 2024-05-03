import { ChainId } from "@aave/contract-helpers";
import { Box } from "@mui/material"
import {
  BridgeTransaction as Transaction
} from "src/hooks/useBridgeTransactionHistory"
import { useGetExecutionState, useGetOffRampForLane } from "src/hooks/useBridgeTransactionStatus";

// interface BridgeTransactionProps {
//   offRamp: string;
//   sequenceNumber: string;
//   sourceChainId: ChainId;
//   destinationChainId: ChainId;
//   blockTimestamp: string;
//   tokenAmounts: {
//     amount: string;
//     token: string;
//   }[];
// }

export const BridgeTransaction = ({ transaction }: { transaction: Transaction }) => {
  const { offRamps, loading } = useGetOffRampForLane(transaction.sourceChainId, transaction.destinationChainId);
  console.log(offRamps, loading);
  const foo = useGetExecutionState(transaction.destinationChainId, transaction.sequenceNumber, offRamps?.map((offRamp) => offRamp.offRamp));
  if (loading) {
    return null;
  }

  return (
    <Box>
      {transaction.sourceChainId} - {transaction.destinationChainId} - {offRamps[0].offRamp} - {foo.data}
    </Box>
  )
}

