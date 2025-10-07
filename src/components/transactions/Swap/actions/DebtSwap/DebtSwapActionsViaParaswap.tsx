import {
  ApproveDelegationType,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import {
  APPROVE_DELEGATION_GAS_LIMIT,
  checkRequiresApproval,
} from 'src/components/transactions/utils';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { calculateSignedAmount, maxInputAmountWithSlippage } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { isParaswapRates, ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';

interface SignedParams {
  signature: string;
  deadline: string;
  amount: string;
}

export const DebtSwapActionsViaParaswap = ({
  state,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [
    getCreditDelegationApprovedAmount,
    currentMarketData,
    generateApproveDelegation,
    estimateGasLimit,
    addTransaction,
    debtSwitch,
    walletApprovalMethodPreference,
    generateCreditDelegationSignatureRequest,
  ] = useRootStore(
    useShallow((state) => [
      state.getCreditDelegationApprovedAmount,
      state.currentMarketData,
      state.generateApproveDelegation,
      state.estimateGasLimit,
      state.addTransaction,
      state.debtSwitch,
      state.walletApprovalMethodPreference,
      state.generateCreditDelegationSignatureRequest,
    ])
  );
  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setGasLimit,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();
  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const [approvedAmount, setApprovedAmount] = useState<ApproveDelegationType | undefined>();
  const [useSignature, setUseSignature] = useState(false);
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const approvalWithSignatureAvailable = currentMarketData.v3;

  useEffect(() => {
    const preferSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT;
    setUseSignature(preferSignature);
  }, [walletApprovalMethodPreference]);

  const amountToSwap = maxInputAmountWithSlippage(
    state.outputAmount,
    (Number(state.slippage) * 100).toString(),
    state.destinationReserve.reserve.decimals || 18
  );

  // const maxNewDebtAmountToReceiveWithSlippage = maxInputAmountWithSlippage(
  //   state.inputAmount,
  //   (Number(state.slippage) * 100).toString(),
  //   state.sourceReserve.reserve.decimals || 18
  // );
  const maxNewDebtAmountToReceiveWithSlippage = state.inputAmount;

  const approval = async () => {
    try {
      if (requiresApproval && approvedAmount) {
        const approveDelegationAmount = calculateSignedAmount(
          maxNewDebtAmountToReceiveWithSlippage,
          state.destinationReserve.reserve.decimals,
          0.25
        );

        console.log('approveDelegationAmount', approveDelegationAmount);
        if (useSignature && approvalWithSignatureAvailable) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateCreditDelegationSignatureRequest({
            underlyingAsset: state.destinationReserve.reserve.variableDebtTokenAddress,
            deadline,
            amount: approveDelegationAmount,
            spender: currentMarketData.addresses.DEBT_SWITCH_ADAPTER ?? '',
          });
          const response = await signTxData(signatureRequest);
          setSignatureParams({
            signature: response.toString(),
            deadline,
            amount: approveDelegationAmount,
          });
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
        } else {
          let approveDelegationTxData = generateApproveDelegation({
            debtTokenAddress: state.destinationReserve.reserve.variableDebtTokenAddress,
            delegatee: currentMarketData.addresses.DEBT_SWITCH_ADAPTER ?? '',
            amount: approveDelegationAmount,
          });
          setApprovalTxState({ ...approvalTxState, loading: true });
          approveDelegationTxData = await estimateGasLimit(approveDelegationTxData);
          const response = await sendTx(approveDelegationTxData);
          await response.wait(1);
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          addTransaction(response.hash, {
            action: ProtocolAction.approval,
            txState: 'success',
            asset: state.destinationReserve.reserve.variableDebtTokenAddress,
            amount: approveDelegationAmount,
            assetName: 'varDebt' + state.destinationReserve?.reserve.name,
            spender: currentMarketData.addresses.DEBT_SWITCH_ADAPTER,
          });
          setTxError(undefined);
          fetchApprovedAmount(true);
        }
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      if (!approvalTxState.success) {
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };
  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      if (!state.swapRate || !isParaswapRates(state.swapRate)) {
        throw new Error('No swap rate found');
      }

      console.log('state.slippage', state.slippage);
      const inferredKind = state.swapRate.optimalRateData.side === 'SELL' ? 'sell' : 'buy';
      // CallData for ParaswapRoute, which is inversed to the actual swap (dest -> src)
      const { swapCallData, augustus } = await getTransactionParams(
        inferredKind,
        state.chainId,
        state.destinationToken.addressToSwap,
        state.destinationToken.decimals,
        state.sourceToken.addressToSwap,
        state.sourceToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      // Check if slippage covers max
      console.log('state.inputAmount', state.inputAmount);
      console.log('state.outputAmount', state.outputAmount);
      console.log('state.slippage', state.slippage);
      console.log('maxNewDebtAmountToReceiveWithSlippage', maxNewDebtAmountToReceiveWithSlippage);
      console.log('amountToSwap (outputAmount)', amountToSwap);

      // console.log('va', {
      //   poolReserve: state.sourceReserve.reserve,
      //   targetReserve: state.destinationReserve.reserve,
      //   amountToReceive: parseUnits(
      //     maxNewDebtAmountToReceiveWithSlippage, // the destination debt token amount
      //     state.destinationReserve.reserve.decimals
      //   ).toString(),
      //   amountToSwap: parseUnits(
      //     amountToSwap, // the source debt token amount
      //     state.sourceReserve.reserve.decimals
      //   ).toString(),
      //   isMaxSelected: state.isMaxSelected,
      //   txCalldata: swapCallData,
      //   augustus: augustus,
      //   signatureParams,
      //   isWrongNetwork: state.isWrongNetwork,
      // });

      console.log('maxNewDebtAmountToReceiveWithSlippage', maxNewDebtAmountToReceiveWithSlippage);
      console.log('state.sourceReserve.reserve.decimals', state.sourceReserve.reserve.decimals);
      // Transaction sent to Paraswap Adapter
      const amountToReceiveForDebtSwitch = parseUnits(
        maxNewDebtAmountToReceiveWithSlippage,
        state.sourceReserve.reserve.decimals
      ).toString();
      console.log('amountToReceiveForDebtSwitch', amountToReceiveForDebtSwitch);
      const amountToSwapForDebtSwitch = parseUnits(
        amountToSwap,
        state.destinationReserve.reserve.decimals
      ).toString();

      console.log('amountToSwapForDebtSwitch', amountToSwapForDebtSwitch);
      // 1001333631445975447
      // 1000333298147827619
      let debtSwitchTxData = debtSwitch({
        poolReserve: state.sourceReserve.reserve,
        targetReserve: state.destinationReserve.reserve,
        amountToReceive: amountToSwapForDebtSwitch,
        amountToSwap: amountToReceiveForDebtSwitch,
        isMaxSelected: state.isMaxSelected,
        txCalldata: swapCallData,
        augustus: augustus,
        signatureParams,
        isWrongNetwork: state.isWrongNetwork,
      });
      console.log('debtSwitchTxData', debtSwitchTxData);
      debtSwitchTxData = await estimateGasLimit(debtSwitchTxData);
      console.log('debtSwitchTxData', debtSwitchTxData);
      const response = await sendTx(debtSwitchTxData);
      await response.wait(1);
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action: 'debtSwitch',
        txState: 'success',
        previousState: `${state.outputAmount} variable ${state.sourceReserve.reserve.symbol}`,
        newState: `${state.inputAmount} variable ${state.destinationReserve.reserve.symbol}`,
        amountUsd: valueToBigNumber(
          parseUnits(amountToSwap, state.sourceReserve.reserve.decimals).toString()
        )
          .multipliedBy(state.sourceReserve.reserve.priceInUSD)
          .toString(),
        outAmountUsd: valueToBigNumber(
          parseUnits(
            maxNewDebtAmountToReceiveWithSlippage,
            state.destinationReserve.reserve.decimals
          ).toString()
        )
          .multipliedBy(state.destinationReserve.reserve.priceInUSD)
          .toString(),
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
    } catch (error) {
      console.error('error', error);
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  // callback to fetch approved credit delegation amount and determine execution path on dependency updates
  const fetchApprovedAmount = useCallback(
    async (forceApprovalCheck?: boolean) => {
      // Check approved amount on-chain on first load or if an action triggers a re-check such as an approveDelegation being confirmed
      let approval = approvedAmount;
      if (approval === undefined || forceApprovalCheck) {
        setLoadingTxns(true);
        approval = await getCreditDelegationApprovedAmount({
          debtTokenAddress: state.destinationReserve.reserve.variableDebtTokenAddress,
          delegatee: currentMarketData.addresses.DEBT_SWITCH_ADAPTER ?? '',
        });
        setApprovedAmount(approval);
      } else {
        setRequiresApproval(false);
        setApprovalTxState({});
      }

      if (approval) {
        const fetchedRequiresApproval = checkRequiresApproval({
          approvedAmount: approval.amount,
          amount: maxNewDebtAmountToReceiveWithSlippage,
          signedAmount: '0',
        });
        setRequiresApproval(fetchedRequiresApproval);
        if (fetchedRequiresApproval) setApprovalTxState({});
      }

      setLoadingTxns(false);
    },
    [
      approvedAmount,
      setLoadingTxns,
      getCreditDelegationApprovedAmount,
      state.destinationReserve.reserve.variableDebtTokenAddress,
      currentMarketData.addresses.DEBT_SWITCH_ADAPTER,
      setApprovalTxState,
      state.outputAmount,
    ]
  );

  // Run on first load and when the target reserve changes
  useEffect(() => {
    if (state.inputAmount === '0') return;

    if (!approvedAmount) {
      fetchApprovedAmount();
    } else if (
      approvedAmount.debtTokenAddress !== state.destinationReserve.reserve.variableDebtTokenAddress
    ) {
      fetchApprovedAmount(true);
    }
  }, [
    state.inputAmount,
    approvedAmount,
    fetchApprovedAmount,
    state.destinationReserve.reserve.variableDebtTokenAddress,
  ]);

  // Update gas estimation
  useEffect(() => {
    let switchGasLimit = 0;
    switchGasLimit = Number(gasLimitRecommendations[ProtocolAction.borrow].recommended);
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVE_DELEGATION_GAS_LIMIT);
    }
    setGasLimit(switchGasLimit.toString());
  }, [requiresApproval, approvalTxState, setGasLimit]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      handleApproval={() => approval()}
      requiresApproval={requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      //   sx={sx}
      fetchingData={state.ratesLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || !approvalTxState?.success,
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      blocked={state.actionsBlocked}
      tryPermit={approvalWithSignatureAvailable}
    />
  );
};
