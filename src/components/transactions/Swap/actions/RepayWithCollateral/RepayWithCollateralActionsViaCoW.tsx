import { normalize } from '@aave/math-utils';
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
import { COW_PARTNER_FEE, FLASH_LOAN_FEE_BPS } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getCowFlashLoanSdk, getCowTradingSdkByChainIdAndAppCode } from '../../helpers/cow';
import { calculateInstanceAddress } from '../../helpers/cow/adapters.helpers';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { ExpiryToSecondsMap, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * Repay-with-collateral via CoW Protocol Flashloan Adapters.
 *
 * Flow summary:
 * 1) Approve collateral aToken (permit supported) to the CoW flashloan adapter
 * 2) Compute flashloan fee and sell amount to sign
 * 3) Create a LIMIT order INVERTED relative to the UI: collateral -> debt asset
 *    - The order kind depends on processed side; inversion is required because
 *      we swap the available collateral to acquire the debt asset to repay
 * 4) Post order with adapter-provided swap settings; adapter orchestrates repay
 */
export const RepayWithCollateralActionsViaCoW = ({
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

  // Pre-compute instance address
  useEffect(() => {
    if (state.chainId !== 100) return; // TODO: remove this once we have a supported chainId
    calculateInstanceAddress({
      user,
      validTo,
      type: AaveFlashLoanType.RepayCollateral,
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

  // Approval is aToken ERC20 Approval
  const amountToApprove = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountToken) return '0';
    return calculateSignedAmount(state.sellAmountFormatted, state.sellAmountToken.decimals);
  }, [state.sellAmountFormatted, state.sellAmountToken]);

  // Approval is aToken ERC20 Approval
  const { requiresApproval, approval, tryPermit, signatureParams } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.destinationToken.addressToSwap, // aToken to repay with
    symbol: state.destinationToken.symbol,
    amount: normalize(amountToApprove.toString(), state.sellAmountToken?.decimals ?? 18),
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
      if (
        !state.sellAmountBigInt ||
        !state.sellAmountToken ||
        !state.buyAmountBigInt ||
        !state.buyAmountToken
      )
        return;

      const tradingSdk = await getCowTradingSdkByChainIdAndAppCode(
        state.chainId,
        APP_CODE_PER_SWAP_TYPE[state.swapType],
        'staging'
      );
      const flashLoanSdk = await getCowFlashLoanSdk(state.chainId);

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
        sellAmount: state.sellAmountBigInt,
      });

      // In Repay With Collateral, the order is inverted, we need to sell the collateral to repay with and do a BUY order to the repay amount
      const limitOrder: LimitTradeParameters = {
        sellToken: state.sellAmountToken.underlyingAddress,
        sellTokenDecimals: state.sellAmountToken.decimals,
        buyToken: state.buyAmountToken.underlyingAddress,
        buyTokenDecimals: state.buyAmountToken.decimals,
        sellAmount: sellAmountToSign.toString(),
        buyAmount: state.buyAmountBigInt.toString(),
        kind: state.processedSide === 'buy' ? OrderKind.BUY : OrderKind.SELL,
        validTo,
        slippageBps: Number(state.slippage) * 100,
        partnerFee: COW_PARTNER_FEE(state.sellAmountToken.symbol, state.buyAmountToken.symbol),
      };

      const orderToSign = getOrderToSign(
        {
          chainId: state.chainId,
          from: user,
          networkCostsAmount: '0',
          isEthFlow: false,
          applyQuoteAdjustments: false,
        },
        limitOrder,
        HASH_ZERO
      );

      const orderPostParams = await flashLoanSdk.getOrderPostingSettings(
        AaveFlashLoanType.RepayCollateral,
        {
          chainId: state.chainId,
          validTo,
          owner: user as `0x${string}`,
          flashLoanFeeAmount,
        },
        {
          sellAmount: state.sellAmountBigInt,
          buyAmount: state.buyAmountBigInt,
          orderToSign,
          collateralPermit,
        }
      );

      const result = await tradingSdk.postLimitOrder(limitOrder, orderPostParams.swapSettings);

      trackingHandlers.trackSwap();
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
