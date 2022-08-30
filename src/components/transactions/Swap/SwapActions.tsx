import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getSwapCallData } from 'src/hooks/useSwap';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { OptimalRate } from 'paraswap-core';

export interface SwapActionProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  priceRoute: OptimalRate | null;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
  maxSlippage: number;
}

export const SwapActions = ({
  amountToSwap,
  amountToReceive,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  priceRoute,
  isMaxSelected,
  useFlashLoan,
  maxSlippage,
  ...props
}: SwapActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const { approval, action, requiresApproval, approvalTxState, mainTxState, loadingTxns } =
    useTransactionHandler({
      handleGetTxns: async () => {
        console.log('handleGetTxns');
        const { swapCallData, augustus } = await getSwapCallData({
          srcToken: poolReserve.underlyingAsset,
          srcDecimals: poolReserve.decimals,
          destToken: targetReserve.underlyingAsset,
          destDecimals: targetReserve.decimals,
          user: currentAccount,
          route: priceRoute as OptimalRate,
          chainId: currentNetworkConfig.underlyingChainId || chainId,
          maxSlippage,
        });
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
      skip: !priceRoute || !amountToSwap || parseFloat(amountToSwap) === 0 || !currentAccount,
      deps: [
        amountToSwap,
        amountToReceive,
        priceRoute,
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
      {...props}
    />
  );
};
