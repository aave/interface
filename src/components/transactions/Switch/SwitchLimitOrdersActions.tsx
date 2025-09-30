import {
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  OrderClass,
  OrderKind,
  SupportedChainId,
  TradingSdk,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { GENERAL } from 'src/utils/events';
import { parseUnits } from 'viem';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { checkRequiresApproval } from '../utils';
import {
  COW_APP_DATA,
  COW_PARTNER_FEE,
  HEADER_WIDGET_APP_CODE,
} from './cowprotocol/cowprotocol.helpers';

interface SwitchProps {
  inputAmount: string;
  inputToken: TokenInfoWithBalance;
  outputToken: TokenInfoWithBalance;
  outputAmount: string;
  setShowUSDTResetWarning?: (showUSDTResetWarning: boolean) => void;
  blocked: boolean;
  loading?: boolean;
  isWrongNetwork: boolean;
  chainId: number;
  //setShowGasStation: (showGasStation: boolean) => void;
  poolReserve?: ComputedReserveData;
  targetReserve?: ComputedReserveData;
  expirationTime: number;
  // setIsExecutingActions?: (isExecuting: boolean) => void;
}

export const SwitchLimitOrdersActions = ({
  inputAmount,
  inputToken,
  outputToken,
  setShowUSDTResetWarning,
  blocked,
  loading,
  isWrongNetwork,
  chainId,
  outputAmount,
  expirationTime,
}: // setShowGasStation,
// setIsExecutingActions,
SwitchProps) => {
  const [
    user,
    //addTransaction,
    currentMarketData,
    trackEvent,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      //state.addTransaction,
      state.currentMarketData,
      state.trackEvent,
    ])
  );

  const { approvalTxState, mainTxState, loadingTxns, setMainTxState, setLoadingTxns, setTxError } =
    useModalContext();

  const queryClient = useQueryClient();

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId,
    token: inputToken.address,
    spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId],
  });

  setLoadingTxns(fetchingApprovedAmount);

  let requiresApproval = false;
  if (approvedAmount !== undefined) {
    requiresApproval = checkRequiresApproval({
      approvedAmount: approvedAmount.toString(),
      amount: inputAmount,
      signedAmount: '0',
    });
  }

  const { approval, requiresApprovalReset } = useApprovalTx({
    usePermit: false,
    approvedAmount: {
      amount: approvedAmount?.toString() || '0',
      spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId],
      token: inputToken.address,
      user,
    },
    requiresApproval,
    assetAddress: inputToken.address,
    symbol: inputToken.symbol,
    decimals: inputToken.decimals,
    signatureAmount: inputAmount,
    onApprovalTxConfirmed: () => fetchApprovedAmount(),
    setShowUSDTResetWarning,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.poolReservesDataHumanized(
        findByChainId(chainId) ?? currentMarketData
      ),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.userPoolReservesDataHumanized(
        user,
        findByChainId(chainId) ?? currentMarketData
      ),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.transactionHistory(
        user,
        findByChainId(chainId) ?? currentMarketData
      ),
    });

    queryClient.invalidateQueries({
      queryKey: queryKeysFactory.poolTokens(user, currentMarketData),
    });
  };

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      invalidate();
      const provider = getEthersProvider(wagmiConfig, { chainId });
      const signer = (await provider).getSigner();
      const tradingSdk = new TradingSdk({ chainId, signer, appCode: HEADER_WIDGET_APP_CODE });
      const receipt = await tradingSdk.postLimitOrder(
        {
          sellAmount: parseUnits(inputAmount, inputToken.decimals).toString(),
          buyAmount: parseUnits(outputAmount, outputToken.decimals).toString(),
          kind: OrderKind.SELL,
          sellToken: inputToken.address,
          buyToken: outputToken.address,
          sellTokenDecimals: inputToken.decimals,
          buyTokenDecimals: outputToken.decimals,
          slippageBps: 0,
          partnerFee: COW_PARTNER_FEE(inputToken.symbol, outputToken.symbol),
          validFor: expirationTime,
        },
        {
          appData: COW_APP_DATA(
            inputToken.symbol,
            outputToken.symbol,
            0,
            false,
            OrderClass.LIMIT,
            HEADER_WIDGET_APP_CODE
          ),
        }
      );
      setMainTxState({
        loading: false,
        success: true,
        txHash: receipt.orderId ?? undefined,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
    try {
      const baseTrackingData: Record<string, string | number | undefined> = {
        chainId,
        inputSymbol: inputToken.symbol,
        outputSymbol: outputToken.symbol,
        pair: `${inputToken.symbol}-${outputToken.symbol}`,
        inputAmount,
        provider: 'cowswap',
        // inputAmountUSD: switchRates?.srcUSD,
        // outputAmountUSD: switchRates?.destUSD,
      };

      trackEvent(GENERAL.SWAP, {
        ...baseTrackingData,
      });
    } catch (error) {
      console.error('Error tracking swap event:', error);
    }
  };

  // // Track execution state to pause rate updates during actions
  // useEffect(() => {
  //   const isExecuting = mainTxState.loading || approvalTxState.loading || loadingTxns;

  //   setIsExecutingActions?.(isExecuting);
  // }, [mainTxState.loading, approvalTxState.loading, loadingTxns, setIsExecutingActions]);

  // useEffect(() => {
  //   let switchGasLimit = 0;
  //   if (requiresApproval && !approvalTxState.success) {
  //     switchGasLimit += Number(APPROVAL_GAS_LIMIT);
  //     if (requiresApprovalReset) {
  //       switchGasLimit += Number(APPROVAL_GAS_LIMIT); // Reset approval
  //     }
  //   }
  //   if (isNativeToken(inputToken)) {
  //     switchGasLimit += Number(
  //       gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended
  //     );
  //   }
  //   setGasLimit(switchGasLimit.toString());
  //   setShowGasStation(requiresApproval || isNativeToken(inputToken));
  // }, [requiresApproval, approvalTxState, setGasLimit, setShowGasStation, requiresApprovalReset]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={inputAmount}
      handleApproval={() => approval()}
      requiresApproval={!blocked && requiresApproval}
      actionText={<Trans>Create limit order</Trans>}
      actionInProgressText={<Trans>Creating limit order</Trans>}
      errorParams={{
        loading: false,
        disabled: blocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Create limit order</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={false}
      requiresApprovalReset={requiresApprovalReset}
    />
  );
};
