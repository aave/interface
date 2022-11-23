import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { fetchTxParams, ParaSwapParams } from 'src/hooks/paraswap/common';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

interface CollateralRepayBaseProps extends BoxProps {
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
  loading?: boolean;
}

// Used in poolSlice
export interface CollateralRepayActionProps extends CollateralRepayBaseProps {
  augustus: string;
  swapCallData: string;
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
  loading,
  paraswapParams,
  ...props
}: CollateralRepayBaseProps & { paraswapParams: ParaSwapParams }) => {
  const [paraswapRepayWithCollateral, paraswapRepayWithCollateralApproval] = useRootStore(
    (state) => [state.paraswapRepayWithCollateral, state.paraswapRepayWithCollateralApproval]
  );

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useParaSwapTransactionHandler({
      handleGetApprovalTx: async () => {
        return paraswapRepayWithCollateralApproval({
          token: fromAssetData.aTokenAddress,
          amount: repayWithAmount,
        });
      },
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
        return paraswapRepayWithCollateral({
          repayAllDebt,
          repayAmount: route.outputAmount,
          rateMode,
          repayWithAmount: route.inputAmount,
          fromAssetData,
          poolReserve,
          isWrongNetwork,
          symbol,
          useFlashLoan,
          blocked,
          swapCallData: route.swapCallData,
          augustus: route.augustus,
        });
      },
      skip: !repayAmount || parseFloat(repayAmount) === 0 || blocked,
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
      fetchingData={loading}
    />
  );
};
