import {
  bigDecimal,
  chainId as sdkChainId,
  evmAddress,
  RepayRequest,
  signatureFrom,
} from '@aave/client';
import { repay } from '@aave/client/actions';
import { sendWith } from '@aave/client/viem';
import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
} from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { client } from 'pages/_app.page';
import { useEffect, useState } from 'react';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getWalletClient } from 'wagmi/actions';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

export interface RepayActionPropsSDK extends BoxProps {
  amountToRepay: string;
  poolReserve: ReserveWithId;
  isWrongNetwork: boolean;
  poolAddress: string;
  symbol: string;
  repayWithATokens: boolean;
  blocked?: boolean;
  maxApproveNeeded: string;
  setShowUSDTResetWarning?: (showUSDTResetWarning: boolean) => void;
  chainId?: number;
  maxAmountToRepay: string;
}

export const RepayActionsSDK = ({
  amountToRepay,
  poolReserve,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  repayWithATokens,
  blocked,
  maxApproveNeeded,
  setShowUSDTResetWarning,
  chainId,
  maxAmountToRepay,
  ...props
}: RepayActionPropsSDK) => {
  const [tryPermit, walletApprovalMethodPreference, addTransaction, currentMarketData] =
    useRootStore(
      useShallow((state) => [
        state.tryPermit,
        state.walletApprovalMethodPreference,
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
    setGasLimit,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();
  const { currentAccount, chainId: userChainId } = useWeb3Context();
  const queryClient = useQueryClient();
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const isNativeRepay = poolAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
  const permitAvailable = tryPermit({
    reserveAddress: poolAddress,
    isWrappedBaseAsset: !!poolReserve.acceptsNative,
  });
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isRefetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = usePoolApprovedAmount(currentMarketData, poolAddress);

  useEffect(() => {
    setLoadingTxns(fetchingApprovedAmount);
  }, [fetchingApprovedAmount, setLoadingTxns]);

  useEffect(() => {
    if (!isFetchedAfterMount && !repayWithATokens && !isNativeRepay) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, isFetchedAfterMount, repayWithATokens, isNativeRepay]);

  const requiresApproval =
    !repayWithATokens &&
    !isNativeRepay &&
    Number(amountToRepay) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount: Number(amountToRepay) === -1 ? maxApproveNeeded : amountToRepay,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  if (requiresApproval && approvalTxState?.success) {
    setApprovalTxState({});
  }

  const { approval, requiresApprovalReset } = useApprovalTx({
    usePermit,
    approvedAmount,
    requiresApproval,
    assetAddress: poolAddress,
    symbol,
    decimals: poolReserve.underlyingToken.decimals,
    signatureAmount: amountToRepay === '-1' ? maxApproveNeeded : amountToRepay,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
    chainId,
    setShowUSDTResetWarning,
  });

  useEffect(() => {
    let repayGasLimit = Number(gasLimitRecommendations[ProtocolAction.repay].recommended);
    if (requiresApproval && !approvalTxState.success) {
      repayGasLimit += Number(APPROVAL_GAS_LIMIT);
    }
    setGasLimit(repayGasLimit.toString());
  }, [approvalTxState.success, requiresApproval, setGasLimit]);

  const handleAction = async () => {
    if (!currentAccount || !amountToRepay || Number(amountToRepay) === 0) return;

    try {
      setLoadingTxns(true);
      setMainTxState({ ...mainTxState, loading: true });
      setTxError(undefined);

      const walletClient = await getWalletClient(wagmiConfig, {
        chainId: chainId ?? currentMarketData.chainId ?? userChainId,
      });

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }
      const normalized = amountToRepay === '-1' ? maxAmountToRepay : amountToRepay;
      const amountInput: RepayRequest['amount'] = isNativeRepay
        ? { native: bigDecimal(normalized) }
        : {
            erc20: {
              currency: evmAddress(poolAddress),
              value: { exact: bigDecimal(normalized) },
              permitSig:
                usePermit && signatureParams
                  ? {
                      value: signatureFrom(signatureParams.signature as string),
                      deadline: Number(signatureParams.deadline),
                    }
                  : null,
            },
          };

      const result = await repay(client, {
        market: evmAddress(currentMarketData.addresses.LENDING_POOL),
        amount: amountInput,
        sender: evmAddress(currentAccount),
        chainId: sdkChainId(chainId ?? currentMarketData.chainId),
      })
        .andThen(sendWith(walletClient))
        .andThen(client.waitForTransaction);

      if (result.isErr()) {
        const parsedError = getErrorTextFromError(
          result.error as Error,
          TxAction.MAIN_ACTION,
          false
        );
        setTxError(parsedError);
        setMainTxState({ txHash: undefined, loading: false });
        return;
      }

      const txHash = String(result.value);
      setMainTxState({
        txHash,
        loading: false,
        success: true,
      });

      addTransaction(txHash, {
        action: ProtocolAction.repay,
        txState: 'success',
        asset: poolAddress,
        amount: normalized,
        assetName: symbol,
        amountUsd: valueToBigNumber(normalized)
          .multipliedBy(poolReserve.usdExchangeRate)
          .toString(),
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
    } catch (error) {
      const parsedError = getErrorTextFromError(error as Error, TxAction.MAIN_ACTION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    } finally {
      setLoadingTxns(false);
    }
  };

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      symbol={poolReserve.underlyingToken.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay || '0'}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={handleAction}
      handleApproval={requiresApproval ? approval : undefined}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      tryPermit={permitAvailable}
      requiresApprovalReset={requiresApprovalReset}
    />
  );
};
