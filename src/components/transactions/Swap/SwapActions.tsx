import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { fetchTxParams, ParaSwapParams } from 'src/hooks/paraswap/common';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

interface SwapBaseProps extends BoxProps {
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
  loading?: boolean;
}

export interface SwapActionProps extends SwapBaseProps {
  swapCallData: string;
  augustus: string;
}

export const SwapActions = ({
  amountToSwap,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  isMaxSelected,
  useFlashLoan,
  loading,
  symbol,
  paraswapParams,
  blocked,
  ...props
}: SwapBaseProps & { paraswapParams: ParaSwapParams }) => {
  const swapCollateral = useRootStore((state) => state.swapCollateral);

  const { approval, action, requiresApproval, approvalTxState, mainTxState, loadingTxns } =
    useParaSwapTransactionHandler({
      handleGetTxns: async () => {
        const route = await fetchTxParams(
          paraswapParams.swapInData,
          paraswapParams.swapOutData,
          paraswapParams.chainId,
          paraswapParams.userAddress,
          paraswapParams.maxSlippage,
          paraswapParams.swapVariant,
          paraswapParams.max
        );
        const minimumReceived = new BigNumber(route.outputAmount || '0')
          .multipliedBy(new BigNumber(100).minus(paraswapParams.maxSlippage).dividedBy(100))
          .toString(10);
        return swapCollateral({
          amountToSwap: route.inputAmount,
          amountToReceive: minimumReceived,
          poolReserve,
          targetReserve,
          isWrongNetwork,
          symbol,
          blocked,
          isMaxSelected,
          useFlashLoan,
          swapCallData: route.swapCallData,
          augustus: route.augustus,
        });
      },
      skip: !amountToSwap || parseFloat(amountToSwap) === 0,
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
      handleApproval={() => approval()}
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      sx={sx}
      fetchingData={loading}
      {...props}
    />
  );
};
