import {
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  OrderKind,
  SupportedChainId,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { BigNumber } from 'ethers';
import { Dispatch, useMemo } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { isSmartContractWallet } from 'src/helpers/provider';
import { useModalContext } from 'src/hooks/useModal';
import { useSwapOrdersTracking } from 'src/hooks/useSwapOrdersTracking';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import { getPreSignTransaction, sendOrder } from '../../helpers/cow';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  ExpiryToSecondsMap,
  isCowProtocolRates,
  isShieldBlocked,
  OrderType,
  SwapParams,
  SwapState,
} from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

/**
 * aToken swap via CoW Protocol (Limit/Market orders), used by collateral swap without flash loan
 * and withdraw and swap. Token swaps go through SwapActionsViaBackend.
 *
 * Process:
 * 1) Ensure token approval (with permit when possible) for the CoW Relayer. Handles smart contract wallets.
 * 2) For tokens requiring approval, attempts onchain approval and reacts to possible failures or pending states.
 * 3) For ERC-20s supporting permit, attempts signature path unless already approved.
 * 4) Handles both normal EOA users and smart contract wallets (e.g. Gnosis Safe) with pre-sign or off-chain signatures as needed.
 * 5) Posts order to the CoW API (off-chain) or submits on-chain pre-sign transaction, depending on user/wallet.
 * 6) Tracks tx/analytics and updates transaction state accurately for UI.
 *
 * Automatically accounts for amount normalization, possible token decimal mismatches,
 * error states in approvals or post order flow, and UI feedback for each path.
 */
export const SwapActionsViaCoW = ({
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
  const [user, estimateGasLimit, addTransaction, currentMarket] = useRootStore(
    useShallow((state) => [
      state.account,
      state.estimateGasLimit,
      state.addTransaction,
      state.currentMarket,
    ])
  );

  const { mainTxState, loadingTxns, setMainTxState, setTxError, approvalTxState } =
    useModalContext();

  const { hasActiveOrderForSellToken } = useSwapOrdersTracking();

  const disablePermitDueToActiveOrder = hasActiveOrderForSellToken(
    state.chainId,
    state.sourceToken.addressToSwap
  );

  const validTo = useMemo(
    () => Math.floor(Date.now() / 1000) + ExpiryToSecondsMap[state.expiry],
    [state.expiry]
  );

  const {
    requiresApproval,
    requiresApprovalReset,
    approval,
    tryPermit,
    signatureParams,
    loadingPermitData,
  } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap,
    symbol: state.sourceToken.symbol,
    amount: state.sellAmountFormatted ?? '0',
    decimals: state.sourceToken.decimals,
    spender: isCowProtocolRates(state.swapRate)
      ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[state.chainId as SupportedChainId]
      : undefined,
    setState,
    allowPermit: !disablePermitDueToActiveOrder,
    trackingHandlers,
    swapType: state.swapType,
    validTo,
  });

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset,
    approvalTxState,
  });

  const { sendTx } = useWeb3Context();

  const slippageInPercent = state.slippage;

  const sellAmountAccountingCosts = state.sellAmountBigInt;
  const buyAmountAccountingCosts = state.buyAmountBigInt;

  const action = async () => {
    if (!sellAmountAccountingCosts || !buyAmountAccountingCosts) {
      return;
    }

    setMainTxState({ ...mainTxState, loading: true });
    if (isCowProtocolRates(state.swapRate)) {
      if (state.useFlashloan) {
        setTxError(
          getErrorTextFromError(new Error('Please use flashloan'), TxAction.MAIN_ACTION, true)
        );
        setState({
          actionsLoading: false,
        });
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
        return;
      }

      try {
        const provider = await getEthersProvider(wagmiConfig, { chainId: state.chainId });
        const slippageBps =
          state.orderType === OrderType.LIMIT ? 0 : Math.round(Number(slippageInPercent) * 100); // percent to bps
        const smartSlippage = state.swapRate.suggestedSlippage == Number(slippageInPercent);
        const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

        // Callers sell aTokens only; native token swaps go through the backend.
        let orderId;
        try {
          if (await isSmartContractWallet(user, provider)) {
            const preSignTransaction = await getPreSignTransaction({
              provider,
              validTo,
              tokenDest: state.destinationToken.addressToSwap,
              chainId: state.chainId,
              user,
              sellAmount: sellAmountAccountingCosts.toString(),
              buyAmount: buyAmountAccountingCosts.toString(),
              tokenSrc: state.sourceToken.addressToSwap,
              tokenSrcDecimals: state.sourceToken.decimals,
              tokenDestDecimals: state.destinationToken.decimals,
              slippageBps,
              smartSlippage,
              inputSymbol: state.sourceToken.symbol,
              outputSymbol: state.destinationToken.symbol,
              quote: state.swapRate?.order,
              appCode,
              orderBookQuote: state.swapRate?.orderBookQuote,
              orderType: state.orderType,
              swapType: params.swapType,
              market: currentMarket,
              kind:
                state.orderType === OrderType.MARKET
                  ? OrderKind.SELL
                  : state.side === 'buy'
                  ? OrderKind.BUY
                  : OrderKind.SELL,
              signatureParams, // TODO: Test permit for smart contract wallets?
              estimateGasLimit,
            });

            const response = await sendTx({
              data: preSignTransaction.data,
              to: preSignTransaction.to,
              value: BigNumber.from(preSignTransaction.value),
              gasLimit: BigNumber.from(preSignTransaction.gasLimit),
            });

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
              loading: false,
              success: true,
              txHash: preSignTransaction.orderId,
            });
          } else {
            orderId = await sendOrder({
              validTo,
              tokenSrc: state.sourceToken.addressToSwap,
              tokenSrcDecimals: state.sourceToken.decimals,
              tokenDest: state.destinationToken.addressToSwap,
              tokenDestDecimals: state.destinationToken.decimals,
              quote: state.swapRate?.order,
              sellAmount: sellAmountAccountingCosts.toString(),
              buyAmount: buyAmountAccountingCosts.toString(),
              slippageBps,
              smartSlippage,
              orderType: state.orderType,
              swapType: params.swapType,
              market: currentMarket,
              kind:
                state.orderType === OrderType.MARKET
                  ? OrderKind.SELL
                  : state.side === 'buy'
                  ? OrderKind.BUY
                  : OrderKind.SELL,
              chainId: state.chainId,
              user,
              provider,
              inputSymbol: state.sourceToken.symbol,
              outputSymbol: state.destinationToken.symbol,
              appCode,
              orderBookQuote: state.swapRate?.orderBookQuote,
              signatureParams,
              estimateGasLimit,
            });
            setMainTxState({
              loading: false,
              success: true,
              txHash: orderId ?? undefined,
            });
          }
        } catch (error) {
          console.error('SwapActionsViaCoW error', error);
          const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
          setTxError(parsedError);
          setMainTxState({
            success: false,
            loading: false,
          });
          setState({
            actionsLoading: false,
          });
        }
      } catch (error) {
        console.error(error);
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
      setState({
        actionsLoading: false,
      });
    }

    trackingHandlers.trackSwap();
  };

  return (
    <TxActionsWrapper
      requiresApprovalReset={requiresApprovalReset}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.processedSide === 'sell' ? state.sellAmountFormatted : state.buyAmountFormatted}
      handleApproval={() => approval()}
      requiresApproval={!areActionsBlocked(state) && requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: areActionsBlocked(state) || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading || loadingPermitData}
      blocked={areActionsBlocked(state)}
      blockedText={isShieldBlocked(state) ? <Trans>Blocked by Shield</Trans> : undefined}
      tryPermit={tryPermit}
      permitInUse={disablePermitDueToActiveOrder}
    />
  );
};
