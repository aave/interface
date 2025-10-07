import { normalize } from '@aave/math-utils';
import { getOrderToSign, LimitTradeParameters, OrderKind, TradingSdk } from '@cowprotocol/cow-sdk';
import { AaveCollateralSwapSdk, HASH_ZERO } from '@cowprotocol/sdk-flash-loans';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/react/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { COW_PARTNER_FEE, FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getCowAdapter } from '../../helpers/cow';
import { calculateInstanceAddress } from '../../helpers/cow/adapters.helpers';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { OrderType, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

export const CollateralSwapActionsViaCowAdapters = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [user] = useRootStore(useShallow((state) => [state.account]));

  const { mainTxState, loadingTxns, approvalTxState, setMainTxState, setTxError } =
    useModalContext();

  const [precalculatedInstanceAddress, setPrecalculatedInstanceAddress] = useState<
    string | undefined
  >();
  const validTo = state.expiry || Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes

  const slippageBps =
    state.orderType === OrderType.LIMIT ? 0 : Math.round(Number(state.slippage) * 100); // percent to bps

  // Pre-compute instance address
  useEffect(() => {
    if (state.chainId !== 100) return; // TODO: remove this once we have a supported chainId
    calculateInstanceAddress(state, user, validTo)
      .catch((error) => {
        console.error('calculateInstanceAddress error', error);
        setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, true));
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
      })
      .then((address) => {
        if (address) setPrecalculatedInstanceAddress(address);
      });
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

  // Approval is aToken ERC20 Approval
  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap,
    symbol: state.sourceToken.symbol,
    amount: state.inputAmount,
    decimals: state.sourceToken.decimals,
    spender: precalculatedInstanceAddress,
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
    setMainTxState({
      txHash: undefined,
      loading: true,
    });
    setState({
      actionsLoading: false,
    });

    try {
      if (!state.minimumReceived) return;

      const sellAmount = normalize(state.inputAmount, -state.sourceToken.decimals);
      const buyAmount = normalize(state.minimumReceived, -state.destinationToken.decimals);

      const adapter = await getCowAdapter(state.chainId);
      const tradingSdk = new TradingSdk(
        {
          chainId: state.chainId,
          appCode: APP_CODE_PER_SWAP_TYPE[state.swapType],
          env: 'staging',
          signer: adapter.signer,
        },
        {},
        adapter
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

      const partnerFee = COW_PARTNER_FEE(state.sourceToken.symbol, state.destinationToken.symbol);

      const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
        flashLoanFeePercent: FLASH_LOAN_FEE_BPS / 100,
        sellAmount: BigInt(sellAmount),
      });

      const limitOrder: LimitTradeParameters = {
        sellToken: state.sourceToken.underlyingAddress,
        sellTokenDecimals: state.sourceToken.decimals,
        buyToken: state.destinationToken.underlyingAddress,
        buyTokenDecimals: state.destinationToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: buyAmount.toString(),
        kind: state.side === 'buy' ? OrderKind.BUY : OrderKind.SELL,
        validTo,
        slippageBps,
        partnerFee,
      };

      const orderToSign = getOrderToSign(
        { chainId: state.chainId, from: user, networkCostsAmount: '0', isEthFlow: false },
        limitOrder,
        HASH_ZERO
      );

      const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
        {
          chainId: state.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
        },
        {
          sellAmount: BigInt(sellAmount),
          buyAmount: BigInt(buyAmount),
          orderToSign,
          collateralPermit,
        }
      );

      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings);

      trackingHandlers.trackSwap();
      params.invalidateAppState();
      setMainTxState({
        loading: false,
        success: true,
        txHash: result.orderId,
      });
      setState({
        actionsLoading: false,
      });
    } catch (error) {
      console.error('CollateralSwapActionsViaCoWAdapters error', error);
      setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, true));
      setMainTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
      setState({
        actionsLoading: false,
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
      blocked={state.actionsBlocked || !precalculatedInstanceAddress}
      tryPermit={tryPermit}
    />
  );
};
