import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { OptimalRate } from 'paraswap-core';
import { updatePythPriceTx } from 'src/helpers/pythHelpers';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

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
  priceRoute: OptimalRate | null;
  repayAllDebt: boolean;
  useFlashLoan: boolean;
  blocked: boolean;
  maxSlippage: number;
  updateData: string[];
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
  priceRoute,
  repayAllDebt,
  useFlashLoan,
  blocked,
  maxSlippage,
  updateData,
  ...props
}: RepayActionProps) => {
  const paraswapRepayWithCollateral = useRootStore((state) => state.paraswapRepayWithCollateral);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useTransactionHandler({
      handleGetTxns: async () => {
        return paraswapRepayWithCollateral({
          repayAllDebt,
          repayAmount,
          maxSlippage,
          rateMode,
          repayWithAmount,
          fromAssetData,
          poolReserve,
          isWrongNetwork,
          symbol,
          priceRoute,
          useFlashLoan,
          blocked,
          updateData,
        });
      },
      skip: !repayAmount || parseFloat(repayAmount) === 0 || blocked,
      deps: [
        repayWithAmount,
        repayAmount,
        priceRoute,
        poolReserve.underlyingAsset,
        fromAssetData.underlyingAsset,
        repayAllDebt,
        useFlashLoan,
      ],
    });

  const sequentialtxs = () => updatePythPriceTx(updateData).then(action);

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={repayAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={sequentialtxs}
      handleApproval={() => approval()}
      actionText={<Trans>Update Price & Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
    />
  );
};
