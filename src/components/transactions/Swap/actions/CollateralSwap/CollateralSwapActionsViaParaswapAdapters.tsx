import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Dispatch, useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import {
  calculateSignedAmount,
  fetchExactInTxParams,
  minimumReceivedAfterSlippage,
} from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { isParaswapRates, SwapParams, SwapState } from '../../types';

export const CollateralSwapActionsViaParaswapAdapters = ({
  params,
  state,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { setTxError, setMainTxState } = useModalContext();
  const { addTransaction } = useRootStore();
  const { reserves } = useAppDataContext();

  const poolReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === state.sourceToken.addressToSwap.toLowerCase()
  ) as ComputedReserveData | undefined;
  const targetReserve = reserves.find(
    (r) => r.underlyingAsset.toLowerCase() === state.destinationToken.addressToSwap.toLowerCase()
  ) as ComputedReserveData | undefined;
  const userAddress = useRootStore.getState().account;
  const [swapCollateral, currentMarketData] = useRootStore(
    useShallow((state) => [state.swapCollateral, state.currentMarketData])
  );

  const buildTxFn = async () => {
    if (!optimalRateData) throw new Error('Route required to build transaction');
    if (!poolReserve || !targetReserve) throw new Error('Pool reserve or target reserve not found');

    // Create SwapData objects with only the required properties
    const swapIn = {
      amount: state.inputAmount,
      underlyingAsset: poolReserve.underlyingAsset,
      decimals: poolReserve?.decimals,
      supplyAPY: poolReserve?.supplyAPY,
      variableBorrowAPY: poolReserve?.variableBorrowAPY,
    };

    const swapOut = {
      amount: normalize(state.swapRate?.destAmount ?? '0', state.swapRate?.destDecimals ?? 18),
      underlyingAsset: targetReserve?.underlyingAsset,
      decimals: targetReserve?.decimals,
      supplyAPY: targetReserve?.supplyAPY,
      variableBorrowAPY: targetReserve?.variableBorrowAPY,
    };

    const maxSlippage = Number(slippageInPercent);

    return await fetchExactInTxParams(
      optimalRateData,
      swapIn,
      swapOut,
      state.chainId,
      userAddress,
      maxSlippage
    );
  };

  const {
    approval,
    action,
    approvalTxState,
    mainTxState,
    loadingTxns,
    requiresApproval,
    requestingApproval,
  } = useParaSwapTransactionHandler({
    protocolAction: ProtocolAction.swapCollateral,
    handleGetTxns: async (signature, deadline) => {
      const route = await buildTxFn();
      return swapCollateral({
        amountToSwap: state.inputAmount,
        amountToReceive: minimumReceived,
        poolReserve,
        targetReserve,
        isWrongNetwork: state.isWrongNetwork,
        symbol: state.sourceToken.symbol,
        blocked: state.actionsBlocked,
        isMaxSelected: isMaxSelected,
        useFlashLoan: true,
        swapCallData: route.swapCallData,
        augustus: route.augustus,
        signature,
        deadline,
        signedAmount: calculateSignedAmount(state.inputAmount, poolReserve?.decimals ?? 18),
      });
    },
    handleGetApprovalTxns: async () => {
      return swapCollateral({
        amountToSwap: state.inputAmount,
        amountToReceive: minimumReceived,
        poolReserve,
        targetReserve,
        isWrongNetwork: state.isWrongNetwork,
        symbol: state.sourceToken.symbol,
        blocked: state.actionsBlocked,
        isMaxSelected: isMaxSelected,
        useFlashLoan: false,
        swapCallData: '0x',
        augustus: API_ETH_MOCK_ADDRESS,
      });
    },
    gasLimitRecommendation: gasLimitRecommendations[ProtocolAction.swapCollateral].limit,
    skip: state.actionsLoading || !state.inputAmount || parseFloat(state.inputAmount) === 0,
    spender: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER ?? '',
    deps: [targetReserve?.symbol, state.inputAmount],
  });

  useEffect(() => {
    if (mainTxState.success) {
      trackingHandlers.trackSwap();
      params.invalidateAppState();

      addTransaction(
        mainTxState.txHash || '',
        {
          txState: 'success',
        },
        {
          chainId: state.chainId,
        }
      );

      setMainTxState({
        txHash: mainTxState.txHash || '',
        loading: false,
        success: true,
      });
    }
  }, [mainTxState.success]);

  if (!poolReserve || !targetReserve) {
    setTxError(
      getErrorTextFromError(
        new Error('Pool reserve or target reserve not found'),
        TxAction.MAIN_ACTION,
        true
      )
    );
    return null;
  }

  if (!isParaswapRates(state.swapRate)) {
    setTxError(getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true));
    return null;
  }

  const slippageInPercent = (Number(state.slippage) * 100).toString();
  const outputAmount = normalize(state.swapRate?.destAmount, state.swapRate?.destDecimals);
  const minimumReceived = minimumReceivedAfterSlippage(
    outputAmount,
    slippageInPercent,
    state.destinationToken.decimals
  );
  const isMaxSelected = state.inputAmount === state.sourceToken.balance;
  const optimalRateData = state.swapRate.optimalRateData;

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      blocked={state.actionsBlocked || requestingApproval}
      handleApproval={() =>
        approval({
          amount: calculateSignedAmount(state.inputAmount, poolReserve.decimals),
          underlyingAsset: poolReserve.aTokenAddress,
        })
      }
      requiresApproval={requiresApproval}
      actionText={requestingApproval ? <Trans>Checking approval</Trans> : <Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      fetchingData={state.actionsLoading}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked,
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      tryPermit
    />
  );
};
