import { ChainId, EthereumTransactionTypeExtended, GasType, Pool } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps, Button, CircularProgress } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getSwapCallData } from 'src/hooks/useSwap';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { LeftHelperText } from '../FlowCommons/LeftHelperText';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
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
  maxSlippage?: number;
}

export const SwapActions = ({
  amountToSwap,
  amountToReceive,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  priceRoute,
  ...props
}: SwapActionProps) => {
  const { user } = useAppDataContext();
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const {
    approval,
    action,
    requiresApproval,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
    loadingTxns,
  } = useTransactionHandler({
    handleGetTxns: async () => {
      const { swapCallData, augustus } = await getSwapCallData({
        srcToken: poolReserve.underlyingAsset,
        srcDecimals: poolReserve.decimals,
        destToken: targetReserve.underlyingAsset,
        destDecimals: targetReserve.decimals,
        user: currentAccount,
        route: priceRoute as OptimalRate,
        chainId: chainId,
      });
      return lendingPool.swapCollateral({
        fromAsset: poolReserve.underlyingAsset,
        toAsset: targetReserve.underlyingAsset,
        swapAll: true, //amountToSwap === '-1',
        fromAToken: poolReserve.aTokenAddress,
        fromAmount: amountToSwap,
        minToAmount: amountToReceive,
        user: currentAccount,
        flash: user.healthFactor !== '-1',
        augustus,
        swapCallData,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !priceRoute || !amountToSwap || parseFloat(amountToSwap) === 0,
    deps: [amountToSwap, priceRoute],
  });

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleRetry={resetStates}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToSwap}
      handleApproval={() => approval(amountToSwap, poolReserve.aTokenAddress)}
      requiresApproval={true}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      helperText={
        <>
          <LeftHelperText
            amount={amountToSwap}
            error={mainTxState.txError || approvalTxState.txError}
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            requiresApproval={requiresApproval}
          />
          <RightHelperText
            approvalHash={approvalTxState.txHash}
            actionHash={mainTxState.txHash}
            chainId={connectedChainId}
            usePermit={usePermit}
            action="supply"
          />
        </>
      }
      sx={sx}
      {...props}
    />
  );
};
