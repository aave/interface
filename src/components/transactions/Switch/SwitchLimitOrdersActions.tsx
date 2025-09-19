import { ERC20Service } from '@aave/contract-helpers';
import {
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  OrderKind,
  SupportedChainId,
  TradingSdk,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
import { useModalContext } from 'src/hooks/useModal';
import { StaticRate } from 'src/hooks/useStaticRate';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { GENERAL } from 'src/utils/events';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { HEADER_WIDGET_APP_CODE } from './cowprotocol/cowprotocol.helpers';

interface SwitchProps {
  inputAmount: string;
  inputToken: TokenInfoWithBalance;
  outputToken: TokenInfoWithBalance;
  outputAmount: string;
  //setShowUSDTResetWarning: (showUSDTResetWarning: boolean) => void;
  blocked: boolean;
  loading?: boolean;
  isWrongNetwork: boolean;
  chainId: number;
  //switchRates?: SwitchRatesType;
  //setShowGasStation: (showGasStation: boolean) => void;
  poolReserve?: ComputedReserveData;
  targetReserve?: ComputedReserveData;
  // isMaxSelected: boolean;
  // setIsExecutingActions?: (isExecuting: boolean) => void;
  rate: string;
  originalRate: StaticRate;
}

export const SwitchLimitOrdersActions = ({
  inputAmount,
  inputToken,
  outputToken,
  //setShowUSDTResetWarning,
  blocked,
  loading,
  isWrongNetwork,
  chainId,
  outputAmount,
  rate,
  originalRate,
}: // setShowGasStation,
// setIsExecutingActions,
SwitchProps) => {
  const [
    user,
    generateApproval,
    estimateGasLimit,
    //addTransaction,
    currentMarketData,
    trackEvent,
  ] = useRootStore(
    useShallow((state) => [
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      //state.addTransaction,
      state.currentMarketData,
      state.trackEvent,
    ])
  );

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    //setGasLimit,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();

  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      inputAmount === '0' ||
      isWrongNetwork
    )
      return false;
    else return approvedAmount < Number(inputAmount);
  }, [approvedAmount, inputAmount, isWrongNetwork]);

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
    setMainTxState({ ...mainTxState, loading: true });
    invalidate();
    const provider = getEthersProvider(wagmiConfig, { chainId });
    const signer = (await provider).getSigner();
    const tradingSdk = new TradingSdk({ chainId, signer, appCode: HEADER_WIDGET_APP_CODE });
    const orderType = Number(rate) < Number(originalRate?.rate) ? OrderKind.BUY : OrderKind.SELL;
    let receipt;
    if (orderType === OrderKind.BUY) {
      receipt = await tradingSdk.postLimitOrder({
        sellAmount: parseUnits(inputAmount, inputToken.decimals).toString(),
        buyAmount: parseUnits(outputAmount, outputToken.decimals).toString(),
        kind: OrderKind.BUY,
        sellToken: inputToken.address,
        buyToken: outputToken.address,
        sellTokenDecimals: inputToken.decimals,
        buyTokenDecimals: outputToken.decimals,
        validFor: 86400, // 24 hours
      });
    } else {
      receipt = await tradingSdk.postLimitOrder({
        sellAmount: parseUnits(outputAmount, outputToken.decimals).toString(),
        buyAmount: parseUnits(inputAmount, inputToken.decimals).toString(),
        kind: OrderKind.SELL,
        sellToken: inputToken.address,
        buyToken: outputToken.address,
        sellTokenDecimals: inputToken.decimals,
        buyTokenDecimals: outputToken.decimals,
        validFor: 86400, // 24 hours
      });
    }
    setMainTxState({
      loading: false,
      success: true,
      txHash: receipt.orderId ?? undefined,
    });
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

  const approval = async () => {
    const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId];
    const amountToApprove = parseUnits(inputAmount, inputToken.decimals);

    // if (requiresApprovalReset) {
    //   try {
    //     // Create direct ERC20 approval transaction for reset to 0 as ERC20Service requires positive amount
    //     const abi = new ethers.utils.Interface([
    //       'function approve(address spender, uint256 amount)',
    //     ]);
    //     const encodedData = abi.encodeFunctionData('approve', [spender, '0']);
    //     const resetTx = {
    //       data: encodedData,
    //       to: inputToken,
    //       from: user,
    //     };
    //     const resetTxWithGasEstimation = await estimateGasLimit(resetTx, chainId);
    //     setApprovalTxState({ ...approvalTxState, loading: true });
    //     const resetResponse = await sendTx(resetTxWithGasEstimation);
    //     await resetResponse.wait(1);
    //   } catch (error) {
    //     const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
    //     console.error(parsedError);
    //     setTxError(parsedError);
    //     setApprovalTxState({
    //       txHash: undefined,
    //       loading: false,
    //     });
    //   }
    //   fetchApprovedAmount().then(() => {
    //     setApprovalTxState({
    //       loading: false,
    //       success: false,
    //     });
    //   });
    //   return;
    // }

    const approvalData = {
      spender,
      user,
      token: inputToken.address,
      amount: amountToApprove.toString(),
    };
    try {
      const tx = generateApproval(approvalData, { chainId, amount: amountToApprove.toString() });
      const txWithGasEstimation = await estimateGasLimit(tx, chainId);
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
    // Check approval to VaultRelayer
    setApprovalTxState({
      txHash: undefined,
      loading: false,
      success: false,
    });
    setLoadingTxns(true);
    const rpc = getProvider(chainId);
    const erc20Service = new ERC20Service(rpc);
    const approvedTargetAmount = await erc20Service.approvedAmount({
      user,
      token: inputToken.address,
      spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId as SupportedChainId],
    });
    setApprovedAmount(approvedTargetAmount);
    setLoadingTxns(false);
  }, [chainId, setLoadingTxns, user, inputToken, setApprovalTxState]);

  useEffect(() => {
    if (user) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, user]);

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
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: blocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={false}
    />
  );
};
