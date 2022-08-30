import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface RepayActionProps extends BoxProps {
  rateMode: InterestRate;
  repayAmount: string;
  repayWithAmount: string;
  fromAssetData: ComputedReserveData;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  repayAllDebt: boolean;
  useFlashLoan: boolean;
  blocked: boolean;
  swapCallData: string;
  augustus: string;
}

export const CollateralRepayActions = ({
  repayAmount,
  repayWithAmount,
  poolReserve,
  fromAssetData,
  isWrongNetwork,
  sx,
  symbol,
  rateMode,
  repayAllDebt,
  useFlashLoan,
  blocked,
  swapCallData,
  augustus,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount } = useWeb3Context();

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      handleGetTxns: async () => {
        console.log('handleGetTxns', repayAmount);
        console.log('handleGetTxns', repayWithAmount);
        return lendingPool.paraswapRepayWithCollateral({
          user: currentAccount,
          fromAsset: fromAssetData.underlyingAsset,
          fromAToken: fromAssetData.aTokenAddress,
          assetToRepay: poolReserve.underlyingAsset,
          repayWithAmount,
          repayAmount,
          repayAllDebt: false,
          rateMode,
          flash: false,
          swapAndRepayCallData: swapCallData,
          augustus,
        });
      },
      skip: !repayAmount || parseFloat(repayAmount) === 0 || blocked,
      deps: [
        repayWithAmount,
        repayAmount,
        poolReserve.underlyingAsset,
        fromAssetData.underlyingAsset,
        repayAllDebt,
        currentAccount,
        useFlashLoan,
      ],
    });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      symbol={fromAssetData.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={repayAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() => approval()}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
