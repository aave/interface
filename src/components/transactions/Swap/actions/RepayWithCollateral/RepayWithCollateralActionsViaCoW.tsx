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
import { useShallow } from 'zustand/react/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getCowFlashLoanSdk, getCowTradingSdkByChainIdAndAppCode } from '../../helpers/cow';
import { calculateInstanceAddress, OrderCore } from '../../helpers/cow/adapters.helpers';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { ExpiryToSecondsMap, OrderType, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

// In Repay With Collateral, the order is inverted, we need to sell the collateral to repay with and do a BUY order to the repay amount
export const getRepayWithCollateralOrderCore = (state: SwapState): OrderCore => {
  const slippageInPercentage =
    state.orderType === OrderType.LIMIT ? 0 : Number(state.slippage) / 100;

  const sellToken = state.destinationToken;
  const buyToken = state.sourceToken;
  const processedSide = state.side === 'sell' ? 'buy' : 'sell';
  const repayAmount = state.inputAmount;
  const repayDecimals = state.sourceToken.decimals;
  const repayWithAmount = state.outputAmount;
  const repayWithDecimals = state.destinationToken.decimals;

  const sellAmount =
    processedSide === 'buy'
      ? // want to buy exactly the repay amount so I add some sell amount (collateral with slippage)
        normalizeBN(repayWithAmount, -repayWithDecimals)
          .multipliedBy(1 + slippageInPercentage)
          .decimalPlaces(0)
      : // want to sell exactly the repay amount
        normalizeBN(repayWithAmount, -repayDecimals);

  const buyAmount =
    processedSide === 'buy'
      ? // want to buy exactly the repay amount
        normalizeBN(repayAmount, -buyToken.decimals)
      : // want to sell exactly the repay with amount so I add lower buy amount
        normalizeBN(repayAmount, -buyToken.decimals)
          .dividedBy(1 + slippageInPercentage)
          .decimalPlaces(0);

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

export const RepayWithCollateralActionsViaCoW = ({
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

  const orderCore = useMemo(
    () => getRepayWithCollateralOrderCore(state),
    [
      state.inputAmount,
      state.outputAmount,
      state.sourceToken,
      state.destinationToken,
      state.side,
      state.slippage,
      state.orderType,
    ]
  );

  // Pre-compute instance address
  useEffect(() => {
    if (state.chainId !== 100) return; // TODO: remove this once we have a supported chainId
    calculateInstanceAddress({
      user,
      validTo,
      type: AaveFlashLoanType.RepayCollateral,
      orderCore,
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

  // Approval is aToken ERC20 Approval
  const amountToApprove = useMemo(
    () =>
      calculateSignedAmount(
        normalizeBN(orderCore.sellAmount.toString(), orderCore.sellToken.decimals).toString(),
        orderCore.sellToken.decimals
      ),
    [orderCore.sellAmount, orderCore.sellToken.decimals]
  );

  // Approval is aToken ERC20 Approval
  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.destinationToken.addressToSwap, // aToken to repay with
    symbol: state.destinationToken.symbol,
    amount: normalize(amountToApprove.toString(), orderCore.sellToken.decimals),
    decimals: state.destinationToken.decimals,
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
      const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(
        orderCore.chainId,
        APP_CODE_PER_SWAP_TYPE[state.swapType],
        'staging'
      );
      const flashLoanSdk = await getCowFlashLoanSdk(orderCore.chainId);

      const collateralPermit = signatureParams
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
        sellAmount: BigInt(orderCore.sellAmount.toString()),
      });

      // In Repay With Collateral, the order is inverted, we need to sell the collateral to repay with and do a BUY order to the repay amount
      const limitOrder: LimitTradeParameters = {
        sellToken: orderCore.sellToken.underlyingAddress,
        sellTokenDecimals: orderCore.sellToken.decimals,
        buyToken: orderCore.buyToken.underlyingAddress,
        buyTokenDecimals: orderCore.buyToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: orderCore.buyAmount.toString(),
        kind: orderCore.side === 'sell' ? OrderKind.SELL : OrderKind.BUY,
        validTo,
        slippageBps: orderCore.slippageBps,
        partnerFee: orderCore.partnerFee,
      };

      const orderToSign = getOrderToSign(
        { chainId: orderCore.chainId, from: user, networkCostsAmount: '0', isEthFlow: false },
        limitOrder,
        HASH_ZERO
      );

      const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
        AaveFlashLoanType.RepayCollateral,
        {
          chainId: orderCore.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
        },
        {
          sellAmount: BigInt(orderCore.sellAmount.toString()),
          buyAmount: BigInt(orderCore.buyAmount.toString()),
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
      console.error('RepayWithCollateralActionsViaCoW error', error);
      setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, true)); // TODO: Fix cannot copy error
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
          <Trans>
            Repay {state.sourceToken.symbol} with {state.destinationToken.symbol}
          </Trans>
        )
      }
      actionInProgressText={
        approvalTxState.loading ? (
          <Trans>Checking approval</Trans>
        ) : (
          <Trans>
            Repaying {state.sourceToken.symbol} with {state.destinationToken.symbol}
          </Trans>
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
          <Trans>
            Repay {state.sourceToken.symbol} with {state.destinationToken.symbol}
          </Trans>
        ),
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked || !precalculatedInstanceAddress}
      tryPermit={tryPermit}
    />
  );
};
