import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  InterestRate,
  ProtocolAction,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateSignedAmount, SwapTransactionParams } from 'src/hooks/paraswap/common';
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
  signature?: SignatureLike;
  signedAmount?: string;
  deadline?: string;
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
  const { paraswapRepayWithCollateral, currentMarketData } = useRootStore();

  const { approval, action, loadingTxns, approvalTxState, mainTxState, requiresApproval } =
    useParaSwapTransactionHandler({
      protocolAction: ProtocolAction.repayCollateral,
      handleGetTxns: async (signature, deadline) => {
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
          signature,
          deadline,
          signedAmount: calculateSignedAmount(repayWithAmount, fromAssetData.decimals),
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
          useFlashLoan: false,
          blocked,
          swapCallData: '0x',
          augustus: API_ETH_MOCK_ADDRESS,
        });
      },
      gasLimitRecommendation: gasLimitRecommendations[ProtocolAction.repayCollateral].limit,
      skip: loading || !repayAmount || parseFloat(repayAmount) === 0 || blocked,
      spender: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER ?? '',
      deps: [fromAssetData.symbol, repayWithAmount],
    });

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={repayAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={() =>
        approval({
          amount: calculateSignedAmount(repayWithAmount, fromAssetData.decimals),
          underlyingAsset: fromAssetData.aTokenAddress,
        })
      }
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      fetchingData={loading}
      errorParams={{
        loading: false,
        disabled: blocked,
        content: <Trans>Repay {symbol}</Trans>,
        handleClick: action,
      }}
      tryPermit
    />
  );
};
