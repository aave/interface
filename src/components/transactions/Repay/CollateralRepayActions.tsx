import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  InterestRate,
  ProtocolAction,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SwapTransactionParams } from 'src/hooks/paraswap/common';
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
  repayWithAmount,
  buildTxFn,
  ...props
}: CollateralRepayBaseProps & { buildTxFn: () => Promise<SwapTransactionParams> }) => {
  const paraswapRepayWithCollateral = useRootStore((state) => state.paraswapRepayWithCollateral);

  const { approval, action, requiresApproval, loadingTxns, approvalTxState, mainTxState } =
    useParaSwapTransactionHandler({
      handleGetTxns: async () => {
        const route = await buildTxFn();
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
      handleGetApprovalTxns: async () => {
        return paraswapRepayWithCollateral({
          repayAllDebt,
          repayAmount,
          rateMode,
          repayWithAmount,
          fromAssetData,
          poolReserve,
          isWrongNetwork,
          symbol,
          useFlashLoan,
          blocked,
          swapCallData: '0x',
          augustus: API_ETH_MOCK_ADDRESS,
        });
      },
      gasLimitRecommendation: gasLimitRecommendations[ProtocolAction.repayCollateral].limit,
      skip: loading || !repayAmount || parseFloat(repayAmount) === 0 || blocked,
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
      errorParams={{
        loading: false,
        disabled: blocked,
        content: <Trans>Repay {symbol}</Trans>,
        handleClick: action,
      }}
    />
  );
};
