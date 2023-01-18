import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
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
  signature?: SignatureLike;
  deadline?: string;
  signedAmount?: string;
}

export interface SwapActionProps extends SwapBaseProps {
  swapCallData: string;
  augustus: string;
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
  loading,
  symbol,
  blocked,
  buildTxFn,
  ...props
}: SwapBaseProps & { buildTxFn: () => Promise<SwapTransactionParams> }) => {
  const { swapCollateral, currentMarketData } = useRootStore();

  const { approval, action, approvalTxState, mainTxState, loadingTxns, requiresApproval } =
    useParaSwapTransactionHandler({
      handleGetTxns: async (signature, deadline) => {
        const route = await buildTxFn();
        return swapCollateral({
          amountToSwap: route.inputAmount,
          amountToReceive: route.outputAmount,
          poolReserve,
          targetReserve,
          isWrongNetwork,
          symbol,
          blocked,
          isMaxSelected,
          useFlashLoan,
          swapCallData: route.swapCallData,
          augustus: route.augustus,
          signature,
          deadline,
          signedAmount: calculateSignedAmount(amountToSwap, poolReserve.decimals),
        });
      },
      handleGetApprovalTxns: async () => {
        return swapCollateral({
          amountToSwap,
          amountToReceive,
          poolReserve,
          targetReserve,
          isWrongNetwork,
          symbol,
          blocked,
          isMaxSelected,
          useFlashLoan: false,
          swapCallData: '0x',
          augustus: API_ETH_MOCK_ADDRESS,
        });
      },
      gasLimitRecommendation: gasLimitRecommendations[ProtocolAction.swapCollateral].limit,
      skip: loading || !amountToSwap || parseFloat(amountToSwap) === 0,
      spender: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER ?? '',
      deps: [targetReserve.symbol, amountToSwap],
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
      handleApproval={() =>
        approval({
          amount: calculateSignedAmount(amountToSwap, poolReserve.decimals),
          underlyingAsset: poolReserve.aTokenAddress,
        })
      }
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      sx={sx}
      fetchingData={loading}
      errorParams={{
        loading: false,
        disabled: blocked,
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      tryPermit
      {...props}
    />
  );
};
