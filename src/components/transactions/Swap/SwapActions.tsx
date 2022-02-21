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
  setSupplyTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  symbol: string;
  blocked: boolean;
  priceRoute: OptimalRate | null;
  maxSlippage?: number;
}

export const SwapActions = ({
  amountToSwap,
  amountToReceive,
  setSupplyTxState,
  handleClose,
  setGasLimit,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
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
    approved,
    action,
    requiresApproval,
    loading,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
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
      const tx = await lendingPool.swapCollateral({
        fromAsset: poolReserve.underlyingAsset,
        toAsset: targetReserve.underlyingAsset,
        swapAll: amountToSwap === '-1',
        fromAToken: poolReserve.aTokenAddress,
        fromAmount: amountToSwap,
        minToAmount: amountToReceive,
        user: currentAccount,
        flash: user.healthFactor !== '-1',
        augustus,
        swapCallData,
      });
      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !priceRoute || !amountToSwap || parseFloat(amountToSwap) === 0,
    deps: [amountToSwap, priceRoute],
  });

  const hasAmount = amountToSwap && amountToSwap !== '0';

  useEffect(() => {
    setSupplyTxState({
      success: !!mainTxState.txHash,
      txError: mainTxState.txError || approvalTxState.txError,
      gasEstimationError: mainTxState.gasEstimationError || approvalTxState.gasEstimationError,
    });
  }, [setSupplyTxState, mainTxState, approvalTxState]);

  const handleRetry = () => {
    setSupplyTxState({
      txError: undefined,
      success: false,
      gasEstimationError: undefined,
    });
    resetStates();
  };

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      handleClose={handleClose}
      handleRetry={handleRetry}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      hasAmount={hasAmount}
      withAmount
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
    >
      <>
        {hasAmount && requiresApproval && !approved && !approvalTxState.txError && !isWrongNetwork && (
          <Button
            variant="contained"
            onClick={() => approval(amountToSwap, poolReserve.underlyingAsset)}
            disabled={
              approved ||
              loading ||
              isWrongNetwork ||
              blocked ||
              !!approvalTxState.gasEstimationError
            }
            size="large"
            sx={{ minHeight: '44px', mb: 2 }}
          >
            {!approved && !loading && <Trans>Approve to continue</Trans>}
            {!approved && loading && (
              <>
                <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                <Trans>Approving {symbol} ...</Trans>
              </>
            )}
          </Button>
        )}

        {hasAmount &&
          !mainTxState.txHash &&
          !mainTxState.txError &&
          !approvalTxState.txError &&
          !isWrongNetwork && (
            <Button
              variant="contained"
              onClick={action}
              disabled={
                loading ||
                (requiresApproval && !approved) ||
                isWrongNetwork ||
                blocked ||
                !!mainTxState.gasEstimationError
              }
              size="large"
              sx={{ minHeight: '44px' }}
            >
              {!mainTxState.txHash && !mainTxState.txError && (!loading || !approved) && (
                <Trans>Supply {symbol}</Trans>
              )}
              {approved && loading && (
                <>
                  <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
                  <Trans>Pending...</Trans>
                </>
              )}
            </Button>
          )}
      </>
    </TxActionsWrapper>
  );
};
