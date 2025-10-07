import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { defaultAbiCoder, splitSignature } from 'ethers/lib/utils';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from 'src/components/transactions/utils';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useParaswapSellTxParams } from 'src/hooks/paraswap/useParaswapRates';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { permitByChainAndToken } from 'src/ui-config/permitConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { isParaswapRates, SwapParams, SwapState, SwapType } from '../../types';

interface SignedParams {
  signature: string;
  deadline: string;
  amount: string;
  approvedToken: string;
}

export const SwapActionsViaParaswap = ({
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
  const [
    user,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    addTransaction,
    currentMarketData,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.generateSignatureRequest,
      state.addTransaction,
      state.currentMarketData,
    ])
  );

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();

  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
  const { mutateAsync: fetchParaswapTxParams } = useParaswapSellTxParams(state.chainId);
  const tryPermit = permitByChainAndToken[state.chainId]?.[state.sourceToken.addressToSwap];

  const slippageInPercent = (Number(state.slippage) * 100).toString();

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT && tryPermit;

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      state.inputAmount === '0' ||
      state.isWrongNetwork
    )
      return false;
    else return approvedAmount < Number(state.inputAmount);
  }, [approvedAmount, state.inputAmount, state.isWrongNetwork]);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    if (!state.swapRate || params.swapType !== SwapType.Swap) {
      return;
    }

    const amountToApprove = calculateSignedAmount(state.inputAmount, state.swapRate.srcDecimals, 0);
    const currentApproved = calculateSignedAmount(
      approvedAmount?.toString() || '0',
      state.swapRate.srcDecimals,
      0
    );

    if (
      needsUSDTApprovalReset(
        state.sourceToken.symbol,
        state.chainId,
        currentApproved,
        amountToApprove
      )
    ) {
      setState({ ...state, showUSDTResetWarning: true });
      setState({ ...state, requiresApprovalReset: true });
    } else {
      setState({ ...state, showUSDTResetWarning: false });
      setState({ ...state, requiresApprovalReset: false });
    }
  }, [
    state.sourceToken.symbol,
    state.chainId,
    approvedAmount,
    state.inputAmount,
    setState,
    state.swapRate,
  ]);

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    if (isParaswapRates(state.swapRate)) {
      try {
        // Normal switch using paraswap
        const tx = await fetchParaswapTxParams({
          srcToken: state.sourceToken.addressToSwap,
          srcDecimals: state.swapRate.srcDecimals,
          destDecimals: state.swapRate.destDecimals,
          destToken: state.destinationToken.addressToSwap,
          route: state.swapRate.optimalRateData,
          user,
          maxSlippage: Number(slippageInPercent) * 10000,
          permit: signatureParams && signatureParams.signature,
          deadline: signatureParams && signatureParams.deadline,
          partner: APP_CODE_PER_SWAP_TYPE[params.swapType],
        });
        tx.chainId = state.chainId;
        const txWithGasEstimation = await estimateGasLimit(tx, state.chainId);
        const response = await sendTx(txWithGasEstimation);
        try {
          await response.wait(1);
          addTransaction(
            response.hash,
            {
              txState: 'success',
            },
            {
              chainId: state.chainId,
            }
          );
          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          queryClient.invalidateQueries({
            queryKey: queryKeysFactory.poolTokens(user, currentMarketData),
          });
        } catch (error) {
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
          setTxError(parsedError);
          setMainTxState({
            txHash: response.hash,
            loading: false,
          });
          addTransaction(
            response.hash,
            {
              txState: 'failed',
            },
            {
              chainId: state.chainId,
            }
          );
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
    }

    params.invalidateAppState();
    trackingHandlers.trackSwap();
  };

  const approval = async () => {
    let spender;
    if (isParaswapRates(state.swapRate)) {
      // For regular ParaSwap swaps, approve the ParaSwap proxy
      spender = state.swapRate.optimalRateData.tokenTransferProxy;
    } else {
      // Error
      const parsedError = getErrorTextFromError(
        new Error('Invalid swap provider rates.'),
        TxAction.APPROVAL,
        false
      );

      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
      return;
    }

    // Ensure spender is defined
    if (!spender) {
      const parsedError = getErrorTextFromError(
        new Error('Unable to determine spender address for approval.'),
        TxAction.APPROVAL,
        false
      );

      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
      return;
    }

    const amountToApprove = calculateSignedAmount(state.inputAmount, state.swapRate.srcDecimals, 0);

    if (state.requiresApprovalReset) {
      try {
        // Create direct ERC20 approval transaction for reset to 0 as ERC20Service requires positive amount
        const abi = new ethers.utils.Interface([
          'function approve(address spender, uint256 amount)',
        ]);
        const encodedData = abi.encodeFunctionData('approve', [spender, '0']);
        const resetTx = {
          data: encodedData,
          to: state.sourceToken.addressToSwap,
          from: user,
        };
        const resetTxWithGasEstimation = await estimateGasLimit(resetTx, state.chainId);
        setApprovalTxState({ ...approvalTxState, loading: true });
        const resetResponse = await sendTx(resetTxWithGasEstimation);
        await resetResponse.wait(1);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        console.error(parsedError);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
      fetchApprovedAmount().then(() => {
        setApprovalTxState({
          loading: false,
          success: false,
        });
      });

      return;
    }

    const approvalData = {
      spender,
      user,
      token: state.sourceToken.addressToSwap,
      amount: amountToApprove,
    };

    try {
      if (useSignature) {
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        const signatureRequest = await generateSignatureRequest(
          {
            ...approvalData,
            deadline,
          },
          { chainId: state.chainId }
        );
        setApprovalTxState({ ...approvalTxState, loading: true });
        const response = await signTxData(signatureRequest);
        const splitedSignature = splitSignature(response);
        const encodedSignature = defaultAbiCoder.encode(
          ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
          [
            approvalData.user,
            approvalData.spender,
            approvalData.amount,
            deadline,
            splitedSignature.v,
            splitedSignature.r,
            splitedSignature.s,
          ]
        );
        setSignatureParams({
          signature: encodedSignature,
          deadline,
          amount: approvalData.amount,
          approvedToken: approvalData.spender,
        });
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
        });
      } else {
        const tx = generateApproval(approvalData, {
          chainId: state.chainId,
          amount: amountToApprove,
        });
        const txWithGasEstimation = await estimateGasLimit(tx, state.chainId);
        setApprovalTxState({ loading: true });
        const response = await sendTx(txWithGasEstimation);
        await response.wait(1);
        fetchApprovedAmount().then(() => {
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        });
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
      console.error(parsedError);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const fetchApprovedAmount = useCallback(async () => {
    if (isParaswapRates(state.swapRate) && state.swapRate.optimalRateData.tokenTransferProxy) {
      setSignatureParams(undefined);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
      setLoadingTxns(true);
      const rpc = getProvider(state.chainId);
      const erc20Service = new ERC20Service(rpc);
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user,
        token: state.sourceToken.addressToSwap,
        spender: state.swapRate.optimalRateData.tokenTransferProxy,
      });

      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    }
  }, [
    state.chainId,
    setLoadingTxns,
    user,
    state.sourceToken.addressToSwap,
    state.swapRate,
    setApprovalTxState,
    params.swapType,
    currentMarketData,
  ]);

  useEffect(() => {
    if (user) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, user]);

  // Track execution state to pause rate updates during actions
  useEffect(() => {
    const isExecuting = mainTxState.loading || approvalTxState.loading || loadingTxns;

    setState({ ...state, actionsLoading: isExecuting });
  }, [mainTxState.loading, approvalTxState.loading, loadingTxns, setState, state.actionsLoading]);

  useEffect(() => {
    let switchGasLimit = 0;
    if (isParaswapRates(state.swapRate)) {
      switchGasLimit += Number(
        gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended
      );
    }
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVAL_GAS_LIMIT);
      if (state.requiresApprovalReset) {
        switchGasLimit += Number(APPROVAL_GAS_LIMIT); // Reset approval
      }
    }
    setState({ ...state, gasLimit: switchGasLimit.toString() });
    setState({ ...state, showGasStation: requiresApproval });
  }, [requiresApproval, approvalTxState, setState, state.requiresApprovalReset]);

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
      requiresApproval={!state.actionsBlocked && requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked}
      tryPermit={tryPermit}
    />
  );
};
