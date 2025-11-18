import { normalize, valueToBigNumber } from '@aave/math-utils';
import { getOrderToSign, LimitTradeParameters, OrderKind, OrderStatus } from '@cowprotocol/cow-sdk';
import { AaveFlashLoanType, HASH_ZERO } from '@cowprotocol/sdk-flash-loans';
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
import {
  COW_PARTNER_FEE,
  DUST_PROTECTION_MULTIPLIER,
  FLASH_LOAN_FEE_BPS,
} from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import {
  addOrderTypeToAppData,
  getCowFlashLoanSdk,
  getCowTradingSdkByChainIdAndAppCode,
} from '../../helpers/cow';
import { calculateInstanceAddress } from '../../helpers/cow/adapters.helpers';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  ExpiryToSecondsMap,
  isCowProtocolRates,
  isProtocolSwapState,
  OrderType,
  SwapParams,
  SwapState,
} from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * Debt swap via CoW Protocol Flashloan Adapters.
 *
 * Flow summary:
 * 1) Approve delegation on the destination variable debt token (permit supported)
 * 2) Compute flashloan fee and sell amount; we temporarily borrow to close existing debt
 * 3) Create a LIMIT order INVERTED relative to the UI: new debt asset -> old debt asset
 * 4) Post order with adapter swap settings; adapter executes the repay + reborrow atomically
 */
export const DebtSwapActionsViaCoW = ({
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

  // Pre-compute instance address
  useEffect(() => {
    calculateInstanceAddress({
      user,
      validTo,
      type: AaveFlashLoanType.DebtSwap,
      state,
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
  ]);

  const amountToApprove = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountToken) return '0';
    return calculateSignedAmount(state.sellAmountFormatted, state.sellAmountToken.decimals);
  }, [state.sellAmountFormatted, state.sellAmountToken]);

  const { hasActiveOrderForSellToken, trackSwapOrderProgress } = useSwapOrdersTracking();
  const sellAssetAddress =
    state.sellAmountToken?.underlyingAddress || state.sourceToken.addressToSwap;
  const disablePermitDueToActiveOrder = hasActiveOrderForSellToken(state.chainId, sellAssetAddress);

  // Approval is to the destination token via delegation Approval
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
    allowPermit: !disablePermitDueToActiveOrder, // avoid nonce reuse if active order present
    type: 'delegation', // Debt swap uses delegation
    trackingHandlers,
    swapType: state.swapType,
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
      if (
        !state.sellAmountBigInt ||
        !state.sellAmountToken ||
        !state.buyAmountBigInt ||
        !state.buyAmountToken
      )
        return;

      const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(
        state.chainId,
        APP_CODE_PER_SWAP_TYPE[state.swapType]
      );
      const flashLoanSdk = await getCowFlashLoanSdk(state.chainId);

      const buyAmountWithMarginForDustProtection = valueToBigNumber(
        state.buyAmountBigInt.toString()
      )
        .multipliedBy(DUST_PROTECTION_MULTIPLIER)
        .toFixed(0);

      const delegationPermit = signatureParams
        ? {
            amount: signatureParams?.amount,
            deadline: Number(signatureParams?.deadline),
            v: signatureParams?.splitedSignature.v,
            r: signatureParams?.splitedSignature.r,
            s: signatureParams?.splitedSignature.s,
          }
        : undefined;

      const { flashLoanFeeAmount, sellAmountToSign } = flashLoanSdk.calculateFlashLoanAmounts({
        flashLoanFeeBps: FLASH_LOAN_FEE_BPS,
        sellAmount: state.sellAmountBigInt,
      });

      // On Debt Swap, the side is inverted for the swap
      const limitOrder: LimitTradeParameters = {
        sellToken: state.sellAmountToken.underlyingAddress,
        sellTokenDecimals: state.sellAmountToken.decimals,
        buyToken: state.buyAmountToken.underlyingAddress,
        buyTokenDecimals: state.buyAmountToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: buyAmountWithMarginForDustProtection.toString(),
        kind: state.processedSide === 'buy' ? OrderKind.BUY : OrderKind.SELL,
        quoteId: isCowProtocolRates(state.swapRate) ? state.swapRate?.quoteId : undefined,
        validTo,
        slippageBps: state.orderType == OrderType.MARKET ? Number(state.slippage) * 100 : undefined,
        partnerFee: COW_PARTNER_FEE(state.sellAmountToken.symbol, state.buyAmountToken.symbol),
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
        AaveFlashLoanType.DebtSwap,
        {
          chainId: state.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
        },
        {
          sellAmount: state.sellAmountBigInt,
          buyAmount: BigInt(buyAmountWithMarginForDustProtection),
          orderToSign,
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
        // Force re-approve
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
      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings);

      trackingHandlers.trackSwap();
      setMainTxState({
        loading: false,
        success: true,
        txHash: result.orderId,
      });
      // Save to local history and start tracking status
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
        usedAdapter: true, // DebtSwap always uses adapter
        srcAmount: state.sellAmountBigInt.toString(),
        destAmount: state.buyAmountBigInt.toString(),
      });
      trackSwapOrderProgress(result.orderId, state.chainId);
      setState({
        actionsLoading: false,
      });
    } catch (error) {
      console.error('DebtSwapActionsViaCoW error', error);
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
          <Trans>Swap {state.sourceToken.symbol} debt</Trans>
        )
      }
      actionInProgressText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swapping {state.sourceToken.symbol} debt</Trans>
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
          <Trans>Swap {state.sourceToken.symbol} debt</Trans>
        ),
        handleClick: action,
      }}
      fetchingData={state.actionsLoading || loadingPermitData}
      blocked={areActionsBlocked(state) || !precalculatedInstanceAddress}
      tryPermit={tryPermit}
      permitInUse={disablePermitDueToActiveOrder}
    />
  );
};
