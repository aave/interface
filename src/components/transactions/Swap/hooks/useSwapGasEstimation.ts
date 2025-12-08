import { Dispatch, useEffect, useMemo, useRef } from 'react';
import { TxStateType } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { useShallow } from 'zustand/react/shallow';

import { estimateSwapGas, GasEstimationParams } from '../helpers/gasEstimation.helpers';
import { SwapState, TokenType } from '../types';

/**
 * Centralized gas estimation for swap actions.
 *
 * Normalizes inputs required by provider/flow specific estimators and writes
 * only when values change to avoid render loops.
 */
export const useSwapGasEstimation = ({
  state,
  setState,
  requiresApproval,
  requiresApprovalReset,
  approvalTxState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  requiresApproval: boolean;
  requiresApprovalReset: boolean;
  approvalTxState: TxStateType;
}) => {
  const walletApprovalMethodPreference = useRootStore(
    useShallow((store) => store.walletApprovalMethodPreference)
  );
  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  // Memoize gas estimation parameters to prevent unnecessary recalculations
  const gasEstimationParams: GasEstimationParams = useMemo(
    () => ({
      swapType: state.swapType,
      provider: state.provider,
      sourceToken: {
        addressToSwap: state.sourceToken.addressToSwap,
        tokenType: state.sourceToken.tokenType || TokenType.ERC20,
      },
      userIsSmartContractWallet: state.userIsSmartContractWallet,
      requiresApproval,
      requiresApprovalReset,
      approvalTxState,
      useFlashloan: state.useFlashloan ?? false,
      usePermit,
    }),
    [
      state.swapType,
      state.provider,
      state.sourceToken.addressToSwap,
      state.sourceToken.tokenType,
      state.userIsSmartContractWallet,
      requiresApproval,
      requiresApprovalReset,
      approvalTxState.success,
      state.useFlashloan,
      usePermit,
    ]
  );

  // Memoize gas estimation result
  const gasEstimation = useMemo(() => estimateSwapGas(gasEstimationParams), [gasEstimationParams]);

  // Use ref to track previous values and prevent unnecessary updates
  const previousGasEstimation = useRef<{ gasLimit: string; showGasStation: boolean } | null>(null);

  useEffect(() => {
    const currentGasEstimation = {
      gasLimit: gasEstimation.gasLimit,
      showGasStation: gasEstimation.showGasStation,
    };

    // Only update if the values have actually changed
    if (
      !previousGasEstimation.current ||
      previousGasEstimation.current.gasLimit !== currentGasEstimation.gasLimit ||
      previousGasEstimation.current.showGasStation !== currentGasEstimation.showGasStation
    ) {
      setState(currentGasEstimation);
      previousGasEstimation.current = currentGasEstimation;
    }
  }, [gasEstimation.gasLimit, gasEstimation.showGasStation, setState]);
};
