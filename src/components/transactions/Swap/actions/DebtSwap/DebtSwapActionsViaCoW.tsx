import { normalize } from '@aave/math-utils';
import {
  LimitTradeParameters,
  OrderSigningUtils,
  percentageToBps,
  TradingSdk,
} from '@cowprotocol/cow-sdk';
import {
  AaveCollateralSwapSdk,
  CollateralSwapOrder,
  CollateralSwapTradeParams,
  EncodedOrder,
  FlashLoanHookAmounts,
  HASH_ZERO,
} from '@cowprotocol/sdk-flash-loans';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/react/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getCowAdapter, getUnsignerOrder } from '../../helpers/cow';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

const flashLoanFeePercent = 0.05;

export const DebtSwapActionsViaCoW = ({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [user] = useRootStore(useShallow((state) => [state.account]));

  const { mainTxState, loadingTxns, approvalTxState, setMainTxState, setTxError } =
    useModalContext();

  const [instanceAddress, setInstanceAddress] = useState<string | undefined>();

  // Pre-compute instance address
  useEffect(() => {
    const calculateInstanceAddress = async () => {
      if (!state.minimumReceived) return;

      const flashLoanSdk = new AaveCollateralSwapSdk();
      const slippagePercentage = Number(state.slippage) / 100;
      const slippageBps = percentageToBps(slippagePercentage);
      const orderToSing = await getUnsignerOrder(
        normalize(state.inputAmount, -state.sourceToken.decimals),
        normalize(state.minimumReceived, -state.destinationToken.decimals),
        state.destinationToken.underlyingAddress, // TODO: check if aToken or underlying
        user,
        state.chainId,
        state.sourceToken.symbol, // TODO: should be underlying symbol?
        state.destinationToken.symbol, // TODO: should be underlying symbol?
        slippageBps,
        state.autoSlippage == state.slippage,
        APP_CODE_PER_SWAP_TYPE[state.swapType]
      );

      const validTo = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes
      const encodedOrder: EncodedOrder = {
        ...OrderSigningUtils.encodeUnsignedOrder(orderToSing),
        appData: HASH_ZERO,
        validTo: validTo,
      };

      const hookAmounts: FlashLoanHookAmounts = {
        flashLoanAmount: normalize(state.inputAmount, -state.sourceToken.decimals),
        flashLoanFeeAmount: percentageToBps(flashLoanFeePercent).toString(), // TODO: check if flashLoanFeeAmount is correct
        sellAssetAmount: normalize(state.inputAmount, -state.sourceToken.decimals),
        buyAssetAmount: normalize(state.minimumReceived, -state.destinationToken.decimals),
      };

      if (!user) return;
      try {
        const preComputedInstanceAddress = await flashLoanSdk.getExpectedInstanceAddress(
          user as `0x${string}`,
          hookAmounts,
          encodedOrder
        );
        setInstanceAddress(preComputedInstanceAddress);
      } catch (error) {
        setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, true));
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
        return;
      }
    };

    calculateInstanceAddress();
  }, [
    user,
    state.inputAmount,
    state.minimumReceived,
    state.destinationToken.underlyingAddress,
    state.sourceToken.symbol,
    state.destinationToken.symbol,
    state.slippage,
    state.autoSlippage,
    APP_CODE_PER_SWAP_TYPE[state.swapType],
  ]);

  console.log('instanceAddress', instanceAddress);

  // Approval is aToken ERC20 Approval
  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap,
    symbol: state.sourceToken.symbol,
    amount: state.inputAmount,
    decimals: state.sourceToken.decimals,
    spender: instanceAddress,
    setState,
    allowPermit: true, // CoW Adapters do support permit
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
    try {
      if (!state.minimumReceived) return;

      const tradingSdk = new TradingSdk(
        {
          chainId: state.chainId,
          appCode: APP_CODE_PER_SWAP_TYPE[state.swapType],
        },
        {},
        await getCowAdapter(state.chainId)
      );

      const flashLoanSdk = new AaveCollateralSwapSdk();

      const collateralPermit = signatureParams
        ? {
            amount: signatureParams?.amount,
            deadline: Number(signatureParams?.deadline),
            v: signatureParams?.splitedSignature.v,
            r: signatureParams?.splitedSignature.r,
            s: signatureParams?.splitedSignature.s,
          }
        : undefined;

      const validTo = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes
      const collateralSwapTradeParams: CollateralSwapTradeParams = {
        chainId: state.chainId,
        validTo: validTo,
        owner: user as `0x${string}`,
        flashLoanFeeAmount: BigInt(flashLoanFeePercent.toString()), // TODO: check if flashLoanFeeAmount is correct
      };

      const slippagePercentage = Number(state.slippage) / 100;
      const slippageBps = percentageToBps(slippagePercentage);
      const orderToSign = await getUnsignerOrder(
        state.inputAmount,
        state.minimumReceived,
        state.destinationToken.underlyingAddress, // TODO: check if aToken or underlying
        user,
        state.chainId,
        state.sourceToken.symbol, // TODO: should be underlying symbol?
        state.destinationToken.symbol, // TODO: should be underlying symbol?
        slippageBps,
        state.autoSlippage == state.slippage,
        APP_CODE_PER_SWAP_TYPE[state.swapType]
      );

      const collateralSwapQuoteParams: CollateralSwapOrder = {
        sellAmount: BigInt(normalize(state.inputAmount, -state.sourceToken.decimals)),
        buyAmount: BigInt(normalize(state.minimumReceived, -state.destinationToken.decimals)),
        orderToSign: orderToSign,
        collateralPermit,
      };

      const { swapSettings } = await flashLoanSdk.getOrderPostingSettings(
        collateralSwapTradeParams,
        collateralSwapQuoteParams
      );

      const limitOrder: LimitTradeParameters = {
        sellToken: orderToSign.sellToken,
        sellTokenDecimals: state.sourceToken.decimals,
        buyToken: state.destinationToken.addressToSwap,
        buyTokenDecimals: state.destinationToken.decimals,
        kind: orderToSign.kind,
        sellAmount: normalize(state.inputAmount, -state.sourceToken.decimals),
        buyAmount: normalize(state.minimumReceived, -state.destinationToken.decimals),
      };

      const result = await tradingSdk.postLimitOrder(limitOrder, swapSettings);

      console.log(result);
    } catch (error) {
      setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, true));
      setMainTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      sx={{
        mt: 6,
      }}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      handleApproval={approval}
      requiresApproval={!state.actionsBlocked && requiresApproval}
      actionText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swap {state.sourceToken.symbol} collateral</Trans>
        )
      }
      actionInProgressText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swapping {state.sourceToken.symbol} collateral</Trans>
        )
      }
      errorParams={{
        loading: false,
        disabled:
          state.actionsBlocked ||
          approvalTxState.loading ||
          (!approvalTxState.success && requiresApproval),
        content: approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swap {state.sourceToken.symbol} collateral</Trans>
        ),
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked || !instanceAddress}
      tryPermit={tryPermit}
    />
  );
};
