import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BigNumber, PopulatedTransaction } from 'ethers';
import { Dispatch } from 'react';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../../../TxActionsWrapper';
import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

export const RepayWithCollateralActionsViaParaswap = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { setTxError, setMainTxState, approvalTxState } = useModalContext();
  const { sendTx } = useWeb3Context();
  const [paraswapRepayWithCollateral, currentMarketData, estimateGasLimit] = useRootStore(
    useShallow((state) => [
      state.paraswapRepayWithCollateral,
      state.currentMarketData,
      state.estimateGasLimit,
    ])
  );

  const toRepaySelectedAmountFormatted = state.inputAmount;
  const collateralToRepayWithAmountFormatted = state.outputAmount;
  const collateralToRepayAmountToApprove = normalize(
    calculateSignedAmount(
      normalizeBN(
        collateralToRepayWithAmountFormatted,
        -state.destinationToken.decimals
      ).toString(),
      0
    ),
    state.destinationToken.decimals
  );

  // Approval is aToken ERC20 Approval
  const { requiresApproval, signatureParams, approval, tryPermit, approvedAmount } =
    useSwapTokenApproval({
      chainId: state.chainId,
      token: state.destinationToken.addressToSwap, // aToken
      symbol: state.destinationToken.symbol,
      decimals: state.destinationToken.decimals,
      // amount: normalizeBN(state.outputAmount, -state.destinationToken.decimals).toString(), // TODO: need to add a margin to account time for better ux?
      amount: collateralToRepayAmountToApprove.toString(), // TODO: need to add a margin to account time for better ux?
      spender: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
      setState,
    });

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset: state.requiresApprovalReset,
    approvalTxState,
  });

  const action = async () => {
    if (!state.swapRate || !isParaswapRates(state.swapRate))
      throw new Error('Route required to build transaction');

    setMainTxState({
      txHash: undefined,
      loading: true,
    });

    try {
      const tokenToRepayWithBalance = state.destinationToken.balance || '0';
      let safeAmountToRepayAll = valueToBigNumber(state.sourceReserve.variableBorrows || '0');
      // Add in the approximate interest accrued over the next 30 minutes
      safeAmountToRepayAll = safeAmountToRepayAll.plus(
        safeAmountToRepayAll
          .multipliedBy(state.sourceReserve.reserve.variableBorrowAPY)
          .dividedBy(360 * 24 * 2)
      );

      let repayAmount, repayWithAmount;
      if (state.side === 'sell') {
        // If sell order i want to repay exactly the input amount
        repayAmount = state.isMaxSelected
          ? safeAmountToRepayAll.toFixed(state.sourceToken.decimals)
          : toRepaySelectedAmountFormatted;

        // Account slippage to make sure we have enough collateral to repay with
        repayWithAmount = valueToBigNumber(state.outputAmount || '0')
          .multipliedBy(1 + Number(state.slippage) / 100)
          .toFixed(state.destinationToken.decimals);
      } else {
        // If buy order i want use exactly the collateral to repay with amount
        repayWithAmount = state.outputAmount;

        // Account slippage to make sure we pay as much debt as possible
        repayAmount = valueToBigNumber(state.inputAmount || '0')
          .dividedBy(1 + Number(state.slippage) / 100)
          .toFixed(state.sourceToken.decimals);
      }

      // The slippage is factored into the collateral amount because when we swap for 'exactOut', positive slippage is applied on the collateral amount.
      const collateralAmountRequiredToCoverDebt = safeAmountToRepayAll
        .multipliedBy(state.sourceReserve.reserve.priceInUSD)
        .multipliedBy(100 + Number(state.slippage))
        .dividedBy(100)
        .dividedBy(state.destinationReserve.reserve.priceInUSD);

      const repayAllDebt =
        state.isMaxSelected &&
        valueToBigNumber(tokenToRepayWithBalance).gte(collateralAmountRequiredToCoverDebt);

      const invertedSide = state.side === 'sell' ? 'buy' : 'sell';

      // Prepare Swap (inversed, from the collateral asset to the debt to repay asset)
      const { swapCallData, augustus } = await getTransactionParams(
        invertedSide,
        state.chainId,
        state.destinationToken.underlyingAddress,
        state.destinationToken.decimals,
        state.sourceToken.underlyingAddress,
        state.sourceToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      console.log('paraswapRepayWithCollateral', {
        repayAllDebt,
        repayAmount,
        rateMode: params.interestMode,
        repayWithAmount,

        fromAssetData: state.destinationReserve.reserve,
        poolReserve: state.sourceReserve.reserve,

        symbol: state.sourceReserve.reserve.symbol,
        isWrongNetwork: state.isWrongNetwork,
        useFlashLoan: state.useFlashloan || false,
        blocked: state.actionsBlocked,
        swapCallData,
        augustus,
        signature: signatureParams?.splitedSignature,
        deadline: signatureParams?.deadline,
        signedAmount: approvedAmount,
      });

      const txs = await paraswapRepayWithCollateral({
        repayAllDebt,
        repayAmount,
        rateMode: params.interestMode,
        repayWithAmount,

        fromAssetData: state.destinationReserve.reserve,
        poolReserve: state.sourceReserve.reserve,

        symbol: state.sourceReserve.reserve.symbol,
        isWrongNetwork: state.isWrongNetwork,
        useFlashLoan: state.useFlashloan || false,
        blocked: state.actionsBlocked,
        swapCallData,
        augustus,
        signature: signatureParams?.splitedSignature,
        deadline: signatureParams?.deadline,
        signedAmount: approvedAmount,
      });

      const actionTx = txs.find((tx) => ['DLP_ACTION'].includes(tx.txType));
      if (!actionTx) throw new Error('Action tx not found');
      const tx = await actionTx.tx();
      const populatedTx: PopulatedTransaction = {
        to: tx.to,
        from: tx.from,
        data: tx.data,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        nonce: tx.nonce,
        chainId: tx.chainId,
        value: tx.value ? BigNumber.from(tx.value) : undefined,
      };

      const txWithGasEstimation = await estimateGasLimit(populatedTx, state.chainId);
      const response = await sendTx(txWithGasEstimation);
      await response.wait(1);

      trackingHandlers.trackSwap();
      params.invalidateAppState();
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      sx={{
        mt: 6,
      }}
      preparingTransactions={state.actionsLoading}
      mainTxState={state.mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={state.inputAmount == '' ? undefined : state.inputAmount}
      requiresApproval={requiresApproval}
      isWrongNetwork={state.isWrongNetwork}
      blocked={state.actionsBlocked}
      handleAction={action}
      handleApproval={approval}
      actionText={<Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {state.sourceReserve.reserve.symbol}</Trans>}
      fetchingData={state.ratesLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked,
        content: <Trans>Repay {state.sourceReserve.reserve.symbol}</Trans>,
        handleClick: action,
      }}
      tryPermit={tryPermit}
    />
  );
};
