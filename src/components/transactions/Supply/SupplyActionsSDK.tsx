import { bigDecimal, chainId as sdkChainId, evmAddress, signatureFrom } from '@aave/client';
import { supply } from '@aave/client/actions';
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
import React, { useEffect, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
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

export interface SupplyActionPropsSDK extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  setShowUSDTResetWarning?: (showUSDTResetWarning: boolean) => void;
  chainId?: number;
}

export const SupplyActionsSDK = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    setShowUSDTResetWarning,
    chainId,
    ...props
  }: SupplyActionPropsSDK) => {
    const [tryPermit, walletApprovalMethodPreference, addTransaction, currentMarketData] =
      useRootStore(
        useShallow((state) => [
          state.tryPermit,
          state.walletApprovalMethodPreference,
          state.addTransaction,
          state.currentMarketData,
        ])
      );
    const { supplyReserves } = useAppDataContext();
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setMainTxState,
      setGasLimit,
      setTxError,
      setApprovalTxState,
    } = useModalContext();
    const { currentAccount, chainId: userChainId } = useWeb3Context();
    const queryClient = useQueryClient();
    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const isNativeSupply = poolAddress.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
    const permitAvailable = tryPermit({ reserveAddress: poolAddress, isWrappedBaseAsset });

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
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    const requiresApproval =
      Number(amountToSupply) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount?.amount || '0',
        amount: amountToSupply,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      setApprovalTxState({});
    }

    const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    const { approval, requiresApprovalReset } = useApprovalTx({
      usePermit,
      approvedAmount,
      requiresApproval,
      assetAddress: poolAddress,
      symbol,
      decimals,
      signatureAmount: amountToSupply,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
      chainId,
      setShowUSDTResetWarning,
    });

    useEffect(() => {
      let supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
      if (requiresApproval && !approvalTxState.success) {
        supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
      }
      setGasLimit(String(supplyGasLimit));
    }, [approvalTxState.success, requiresApproval, setGasLimit]);

    const handleAction = async () => {
      if (!currentAccount || !amountToSupply || Number(amountToSupply) === 0) return;

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

        const amountInput = isNativeSupply
          ? { native: bigDecimal(amountToSupply) }
          : {
              erc20: {
                currency: evmAddress(poolAddress),
                value: bigDecimal(amountToSupply),
                permitSig:
                  usePermit && signatureParams
                    ? {
                        value: signatureFrom(signatureParams.signature as string),
                        deadline: Number(signatureParams.deadline),
                      }
                    : null,
              },
            };

        const result = await supply(client, {
          market: evmAddress(currentMarketData.addresses.LENDING_POOL),
          amount: amountInput,
          sender: evmAddress(currentAccount),
          onBehalfOf: evmAddress(currentAccount),
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
          action: ProtocolAction.supply,
          txState: 'success',
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
          amountUsd: (() => {
            const reserve = supplyReserves.find(
              (r) => r.underlyingToken.address.toLowerCase() === poolAddress.toLowerCase()
            );
            return reserve
              ? valueToBigNumber(amountToSupply).multipliedBy(reserve.usdExchangeRate).toString()
              : undefined;
          })(),
        });

        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
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
        mainTxState={mainTxState}
        approvalTxState={{}}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleApproval={requiresApproval ? approval : undefined}
        handleAction={handleAction}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        requiresApprovalReset={requiresApprovalReset}
        sx={sx}
        {...props}
      />
    );
  }
);
