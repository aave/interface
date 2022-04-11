import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { OptimalRate } from 'paraswap-core';
import { getRepayCallData, getSwapCallData } from 'src/hooks/useSwap';

export interface RepayActionProps extends BoxProps {
  debtType: InterestRate;
  amountToRepay: string;
  amountToSwap: string;
  repayWithReserve: ComputedReserveData;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  priceRoute: OptimalRate | null;
  isMaxSelected: boolean;
  useFlashLoan: boolean;
}

export const CollateralRepayActions = ({
  amountToRepay,
  amountToSwap,
  poolReserve,
  repayWithReserve,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  priceRoute,
  isMaxSelected,
  useFlashLoan,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      handleGetTxns: async () => {
        const { swapCallData, augustus } = await getRepayCallData({
          srcToken: repayWithReserve.underlyingAsset,
          srcDecimals: repayWithReserve.decimals,
          destToken: poolReserve.underlyingAsset,
          destDecimals: poolReserve.decimals,
          user: currentAccount,
          route: priceRoute as OptimalRate,
          chainId: chainId,
        });
        console.log('----------------------------');
        return lendingPool.paraswapRepayWithCollateral({
          user: currentAccount,
          fromAsset: repayWithReserve.underlyingAsset,
          fromAToken: repayWithReserve.aTokenAddress,
          assetToRepay: poolReserve.underlyingAsset,
          repayWithAmount: amountToSwap,
          repayAmount: amountToRepay,
          repayAllDebt: isMaxSelected,
          rateMode: debtType,
          flash: useFlashLoan,
          swapAndRepayCallData: swapCallData,
          augustus,
        });
      },
      skip: !amountToRepay || parseFloat(amountToRepay) === 0,
      deps: [
        amountToSwap,
        amountToRepay,
        priceRoute,
        poolReserve.underlyingAsset,
        repayWithReserve.underlyingAsset,
        isMaxSelected,
        currentAccount,
        useFlashLoan,
      ],
    });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() => approval(amountToRepay, poolReserve.underlyingAsset)}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
