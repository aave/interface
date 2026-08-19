import { normalize } from '@aave/math-utils';
import { getOrderToSign, LimitTradeParameters, OrderKind, OrderStatus } from '@cowprotocol/cow-sdk';
import { HASH_ZERO } from '@cowprotocol/sdk-flash-loans';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useSwapOrdersTracking } from 'src/hooks/useSwapOrdersTracking';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { saveCowOrderToUserHistory } from 'src/utils/swapAdapterHistory';
import { zeroAddress } from 'viem';
import { useShallow } from 'zustand/react/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { COW_PARTNER_FEE } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import {
  addOrderTypeToAppData,
  getCowLeverageSdk,
  getCowTradingSdkByChainIdAndAppCode,
  overrideSmartSlippageOnAppData,
  toSdkFlashLoanType,
} from '../../helpers/cow';
import { calculateInstanceAddress, getHooksGasLimit } from '../../helpers/cow/adapters.helpers';
import { useCollateralsAmount } from '../../hooks/useCollateralsAmount';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  ExpiryToSecondsMap,
  FlashLoanFlow,
  isCowProtocolRates,
  isProtocolSwapState,
  isShieldBlocked,
  OrderType,
  SwapParams,
  SwapState,
} from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * Leverage via CoW Protocol Flashloan Adapters.
 *
 * Flow summary:
 * 1) Approve delegation on the borrowed asset's variable debt token (permit supported)
 * 2) Flash-loan that asset and sell it for the collateral the user asked for
 * 3) The post-hook supplies the bought collateral, then draws the debt to repay the flash loan
 *
 * The order is INVERTED relative to the UI: the user picks collateral to acquire, the swap sells
 * the debt that finances it.
 */
export const LeverageActionsViaCoW = ({
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [user, currentMarket] = useRootStore(
    useShallow((state) => [state.account, state.currentMarket])
  );

  const collateralsAmount = useCollateralsAmount();

  const {
    mainTxState,
    loadingTxns,
    approvalTxState,
    setMainTxState,
    setTxError,
    setApprovalTxState,
  } = useModalContext();

  const [precalculatedInstanceAddress, setPrecalculatedInstanceAddress] = useState<
    string | undefined
  >();

  const validTo = useMemo(
    () => Math.floor(Date.now() / 1000) + ExpiryToSecondsMap[state.expiry],
    [state.expiry]
  );

  // Skip recalculation while approval is in progress or succeeded, so an in-flight quote cannot
  // change the adapter address and invalidate the user's signature.
  useEffect(() => {
    if (approvalTxState.loading || approvalTxState.success) return;
    calculateInstanceAddress({
      user,
      validTo,
      type: FlashLoanFlow.Leverage,
      state,
      market: currentMarket,
    })
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
    validTo,
    state.sellAmountBigInt,
    state.buyAmountBigInt,
    state.sellAmountToken,
    state.buyAmountToken,
    state.processedSide,
    state.slippage,
    state.orderType,
    state.chainId,
    APP_CODE_PER_SWAP_TYPE[state.swapType],
    approvalTxState.loading,
    approvalTxState.success,
    currentMarket,
  ]);

  const amountToApprove = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountToken) return '0';
    return calculateSignedAmount(state.sellAmountFormatted, state.sellAmountToken.decimals);
  }, [state.sellAmountFormatted, state.sellAmountToken]);

  const { hasActiveOrderForSellToken, trackSwapOrderProgress } = useSwapOrdersTracking();
  const sellAssetAddress =
    state.sellAmountToken?.underlyingAddress || state.destinationToken.addressToSwap;
  const disablePermitDueToActiveOrder = hasActiveOrderForSellToken(state.chainId, sellAssetAddress);

  // The adapter draws the borrowed asset on the user's behalf, so it needs credit delegation on
  // that asset's debt token.
  const {
    requiresApproval,
    approval,
    tryPermit,
    signatureParams,
    loadingPermitData,
    approvedAddress,
  } = useSwapTokenApproval({
    chainId: state.chainId,
    token: isProtocolSwapState(state)
      ? state.destinationReserve.reserve.variableDebtTokenAddress
      : zeroAddress,
    symbol: state.destinationToken.symbol,
    amount: normalize(amountToApprove, state.sellAmountToken?.decimals ?? 18),
    decimals: state.destinationToken.decimals,
    spender: precalculatedInstanceAddress,
    setState,
    allowPermit: !disablePermitDueToActiveOrder,
    type: 'delegation',
    trackingHandlers,
    swapType: state.swapType,
    validTo,
  });

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
      if (
        !state.sellAmountBigInt ||
        !state.sellAmountToken ||
        !state.buyAmountBigInt ||
        !state.buyAmountToken
      )
        return;

      if (state.flashLoanFeeBps === undefined) {
        throw new Error('Flashloan fee unavailable: on-chain ACLManager check has not resolved.');
      }

      const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(
        state.chainId,
        APP_CODE_PER_SWAP_TYPE[state.swapType]
      );
      const flashLoanSdk = await getCowLeverageSdk(state.chainId);

      const delegationPermit = signatureParams
        ? {
            amount: signatureParams.amount,
            deadline: Number(signatureParams.deadline),
            v: signatureParams.splitedSignature.v,
            r: signatureParams.splitedSignature.r,
            s: signatureParams.splitedSignature.s,
          }
        : undefined;

      const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
        flashLoanFeeBps: state.flashLoanFeeBps,
        sellAmount: state.sellAmountBigInt,
      });

      const limitOrder: LimitTradeParameters = {
        sellToken: state.sellAmountToken.underlyingAddress,
        sellTokenDecimals: state.sellAmountToken.decimals,
        buyToken: state.buyAmountToken.underlyingAddress,
        buyTokenDecimals: state.buyAmountToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: state.buyAmountBigInt.toString(),
        kind: state.processedSide === 'buy' ? OrderKind.BUY : OrderKind.SELL,
        quoteId: isCowProtocolRates(state.swapRate) ? state.swapRate?.quoteId : undefined,
        validTo,
        slippageBps: state.orderType == OrderType.MARKET ? Number(state.slippage) * 100 : undefined,
        partnerFee: COW_PARTNER_FEE(
          state.sellAmountToken.symbol,
          state.buyAmountToken.symbol,
          state.swapType,
          currentMarket
        ),
      };

      const orderToSign = getOrderToSign(
        {
          chainId: state.chainId,
          from: user,
          networkCostsAmount: '0',
          isEthFlow: false,
          applyCostsSlippageAndFees: false,
        },
        limitOrder,
        HASH_ZERO
      );

      const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
        toSdkFlashLoanType(FlashLoanFlow.Leverage),
        {
          chainId: state.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
          hooksGasLimit: getHooksGasLimit(collateralsAmount),
        },
        {
          sellAmount: state.sellAmountBigInt,
          buyAmount: state.buyAmountBigInt,
          orderToSign,
          // Carries the credit delegation; the leverage post-hook encodes it as its second tuple.
          collateralPermit: delegationPermit,
        }
      );

      // Safe-check in case any param changed between approval and order posting
      const instanceAddress = orderPostParams.instanceAddress;
      if (instanceAddress !== approvedAddress) {
        console.error(
          'Some parameters changed between approval and order posting: instanceAddress !== approvedAddress, asking for a new approval',
          instanceAddress,
          approvedAddress
        );
        setPrecalculatedInstanceAddress(instanceAddress);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
        setMainTxState({ txHash: undefined, loading: false, success: false });

        return;
      }

      orderPostParams.swapSettings.appData = addOrderTypeToAppData(
        state.orderType,
        orderPostParams.swapSettings.appData
      );

      orderPostParams.swapSettings.appData = overrideSmartSlippageOnAppData(
        state,
        orderPostParams.swapSettings.appData
      );

      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings);

      trackingHandlers.trackSwap();
      setMainTxState({
        loading: false,
        success: true,
        txHash: result.orderId,
      });
      saveCowOrderToUserHistory({
        protocol: 'cow',
        orderId: result.orderId,
        status: OrderStatus.OPEN,
        swapType: state.swapType,
        chainId: state.chainId,
        account: user,
        timestamp: new Date().toISOString(),
        srcToken: {
          address: state.sellAmountToken.underlyingAddress,
          symbol: state.sellAmountToken.symbol,
          name: state.sellAmountToken.symbol,
          decimals: state.sellAmountToken.decimals,
        },
        destToken: {
          address: state.buyAmountToken.underlyingAddress,
          symbol: state.buyAmountToken.symbol,
          name: state.buyAmountToken.symbol,
          decimals: state.buyAmountToken.decimals,
        },
        adapterInstanceAddress: instanceAddress,
        usedAdapter: true,
        srcAmount: state.sellAmountBigInt.toString(),
        destAmount: state.buyAmountBigInt.toString(),
      });
      trackSwapOrderProgress(result.orderId, state.chainId);
      setState({
        actionsLoading: false,
      });
    } catch (error) {
      console.error('LeverageActionsViaCoW error', error);
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
      amount={state.processedSide === 'sell' ? state.sellAmountFormatted : state.buyAmountFormatted}
      handleApproval={approval}
      requiresApproval={!areActionsBlocked(state) && requiresApproval}
      actionText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Leverage {state.sourceToken.symbol}</Trans>
        )
      }
      actionInProgressText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Leveraging {state.sourceToken.symbol}</Trans>
        )
      }
      errorParams={{
        loading: false,
        disabled:
          areActionsBlocked(state) ||
          approvalTxState.loading ||
          (!approvalTxState.success && requiresApproval),
        content: approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Leverage {state.sourceToken.symbol}</Trans>
        ),
        handleClick: action,
      }}
      fetchingData={state.actionsLoading || loadingPermitData}
      blocked={areActionsBlocked(state) || !precalculatedInstanceAddress}
      blockedText={isShieldBlocked(state) ? <Trans>Blocked by Shield</Trans> : undefined}
      tryPermit={tryPermit}
      permitInUse={disablePermitDueToActiveOrder}
    />
  );
};
