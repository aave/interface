import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SwapActionProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
  maxSlippage: number;
  swapCallData: string;
  augustus: string;
  loading: boolean;
}

export const SwapActions = ({
  amountToSwap,
  amountToReceive,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  isMaxSelected,
  useFlashLoan,
  maxSlippage,
  swapCallData,
  augustus,
  loading,
  ...props
}: SwapActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount } = useWeb3Context();

  const { approval, action, requiresApproval, approvalTxState, mainTxState, loadingTxns } =
    useTransactionHandler({
      handleGetTxns: async () => {
        return lendingPool.swapCollateral({
          fromAsset: poolReserve.underlyingAsset,
          toAsset: targetReserve.underlyingAsset,
          swapAll: isMaxSelected,
          fromAToken: poolReserve.aTokenAddress,
          fromAmount: amountToSwap,
          minToAmount: amountToReceive,
          user: currentAccount,
          flash: useFlashLoan,
          augustus,
          swapCallData,
        });
      },
      skip: !amountToSwap || parseFloat(amountToSwap) === 0 || !currentAccount,
      deps: [
        amountToSwap,
        amountToReceive,
        poolReserve.underlyingAsset,
        targetReserve.underlyingAsset,
        isMaxSelected,
        currentAccount,
        useFlashLoan,
      ],
    });

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToSwap}
      handleApproval={() => approval(amountToSwap, poolReserve.aTokenAddress)}
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      sx={sx}
      fetchingData={loading}
      {...props}
    />
  );
};
