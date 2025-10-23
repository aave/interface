import { normalize, normalizeBN } from '@aave/math-utils';
import { getOrderToSign, LimitTradeParameters, OrderKind } from '@cowprotocol/cow-sdk';
import { AaveFlashLoanType, HASH_ZERO } from '@cowprotocol/sdk-flash-loans';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { zeroAddress } from 'viem';
import { useShallow } from 'zustand/react/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getCowFlashLoanSdk, getCowTradingSdkByChainIdAndAppCode } from '../../helpers/cow';
import { calculateInstanceAddress, OrderCore } from '../../helpers/cow/adapters.helpers';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  ExpiryToSecondsMap,
  isProtocolSwapState,
  OrderType,
  SwapParams,
  SwapState,
} from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

// In Debt Swap, the order is inverted, we need to sell the destination debt and buy the source debt
export const getDebtSwapOrderCore = (state: SwapState): OrderCore => {
  const slippageInPercentage =
    state.orderType === OrderType.LIMIT ? 0 : Number(state.slippage) / 100;
  const processedSide = state.side === 'sell' ? 'buy' : 'sell';

  const originDebtAmount = state.inputAmount;
  const originDebtDecimals = state.sourceToken.decimals;
  const originDebtToken = state.sourceToken;
  const destDebtAmount = state.outputAmount;
  const destDebtDecimals = state.destinationToken.decimals;
  const destDebtToken = state.destinationToken;

  const buyAmount =
    processedSide === 'buy'
      ? // want to buy exactly the original debt so we add some newer debt sell amount
        normalizeBN(originDebtAmount, -originDebtDecimals)
      : // want to sell exactly the original debt
        normalizeBN(originDebtAmount, -originDebtDecimals)
          .dividedBy(1 + slippageInPercentage)
          .decimalPlaces(0);
  const buyToken = originDebtToken;

  const sellAmount =
    processedSide === 'buy'
      ? // want to buy exactly the output debt
        normalizeBN(destDebtAmount, -destDebtDecimals)
          .multipliedBy(1 + slippageInPercentage)
          .decimalPlaces(0)
      : // want to sell exactly the output debt so we lower the buy amount
        normalizeBN(destDebtAmount, -destDebtDecimals);
  const sellToken = destDebtToken;

  // TODO: REQUIRES FIX IN COW SDK
  // slippageBps = slippageInPercentage * 10000
  // const partnerFee = COW_PARTNER_FEE(state.sourceToken.symbol, state.destinationToken.symbol);
  const partnerFee = {
    volumeBps: 0,
    recipient: '0x0000000000000000000000000000000000000000',
  };
  const slippageBps = 0;

  return {
    chainId: state.chainId,
    sellAmount,
    buyAmount,
    sellToken,
    buyToken,
    side: processedSide,
    slippageBps,
    partnerFee,
  };
};

export const DebtSwapActionsViaCoW = ({
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

  const validTo = useMemo(
    () => Math.floor(Date.now() / 1000) + ExpiryToSecondsMap[state.expiry],
    [state.expiry]
  );

  const cowSwap = useMemo(() => {
    const orderCore = getDebtSwapOrderCore(state);
    return orderCore;
  }, [
    state.inputAmount,
    state.outputAmount,
    state.sourceToken,
    state.destinationToken,
    state.side,
    state.slippage,
    state.orderType,
  ]);

  // Pre-compute instance address
  useEffect(() => {
    if (state.chainId !== 100) return; // TODO: remove this once we have a supported chainId
    calculateInstanceAddress({
      user,
      validTo,
      type: AaveFlashLoanType.DebtSwap,
      orderCore: cowSwap,
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
    state.inputAmount,
    state.minimumReceived,
    state.destinationToken.underlyingAddress,
    state.sourceToken.symbol,
    state.destinationToken.symbol,
    state.slippage,
    state.autoSlippage,
    APP_CODE_PER_SWAP_TYPE[state.swapType],
  ]);

  const amountToApprove = useMemo(
    () =>
      calculateSignedAmount(
        normalizeBN(cowSwap.sellAmount.toString(), cowSwap.sellToken.decimals).toString(),
        cowSwap.sellToken.decimals
      ),
    [cowSwap.sellAmount, cowSwap.sellToken.decimals]
  );

  // Approval is to the destination token via delegation Approval
  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: isProtocolSwapState(state)
      ? state.destinationReserve.reserve.variableDebtTokenAddress
      : zeroAddress,
    symbol: state.destinationToken.symbol,
    amount: normalize(amountToApprove.toString(), cowSwap.sellToken.decimals),
    decimals: state.destinationToken.decimals,
    spender: precalculatedInstanceAddress,
    setState,
    allowPermit: true, // CoW Adapters do support permit
    type: 'delegation', // Debt swap uses delegation
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
      const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(
        cowSwap.chainId,
        APP_CODE_PER_SWAP_TYPE[state.swapType],
        'staging'
      );
      const flashLoanSdk = await getCowFlashLoanSdk(cowSwap.chainId);

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
        sellAmount: BigInt(cowSwap.sellAmount.toString()),
      });

      const limitOrder: LimitTradeParameters = {
        sellToken: cowSwap.sellToken.underlyingAddress,
        sellTokenDecimals: cowSwap.sellToken.decimals,
        buyToken: cowSwap.buyToken.underlyingAddress,
        buyTokenDecimals: cowSwap.buyToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: cowSwap.buyAmount.toString(),
        kind: cowSwap.side === 'buy' ? OrderKind.BUY : OrderKind.SELL,
        validTo,
        slippageBps: cowSwap.slippageBps,
        partnerFee: cowSwap.partnerFee,
      };

      const orderToSign = getOrderToSign(
        { chainId: cowSwap.chainId, from: user, networkCostsAmount: '0', isEthFlow: false },
        limitOrder,
        HASH_ZERO
      );

      const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
        AaveFlashLoanType.DebtSwap,
        {
          chainId: cowSwap.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
        },
        {
          sellAmount: BigInt(cowSwap.sellAmount.toString()),
          buyAmount: BigInt(cowSwap.buyAmount.toString()),
          orderToSign,
          collateralPermit: delegationPermit,
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
      amount={state.inputAmount}
      handleApproval={approval}
      requiresApproval={!state.actionsBlocked && requiresApproval}
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
          state.actionsBlocked ||
          approvalTxState.loading ||
          (!approvalTxState.success && requiresApproval),
        content: approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>Swap {state.sourceToken.symbol} debt</Trans>
        ),
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked || !precalculatedInstanceAddress}
      tryPermit={tryPermit}
    />
  );
};
