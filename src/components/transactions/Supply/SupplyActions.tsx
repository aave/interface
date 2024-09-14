import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useTonTransactions } from 'src/hooks/useTonTransactions';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

export interface SupplyActionProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
  underlyingAssetTon?: string;
  poolJettonWalletAddress?: string;
  isJetton?: boolean;
}

export const SupplyActions = React.memo(
  ({
    amountToSupply,
    poolAddress,
    isWrongNetwork,
    sx,
    symbol,
    blocked,
    decimals,
    isWrappedBaseAsset,
    underlyingAssetTon,
    isJetton,
    ...props
  }: SupplyActionProps) => {
    const { isConnectedTonWallet, walletAddressTonWallet } = useTonConnectContext();
    const { getPoolContractGetReservesData, getYourSupplies } = useAppDataContext();
    const { onSendSupplyTon, approvedAmountTonAssume } = useTonTransactions(
      walletAddressTonWallet,
      `${underlyingAssetTon}`
    );
    const [
      tryPermit,
      supply,
      supplyWithPermit,
      walletApprovalMethodPreference,
      estimateGasLimit,
      addTransaction,
      currentMarketData,
    ] = useRootStore((state) => [
      state.tryPermit,
      state.supply,
      state.supplyWithPermit,
      state.walletApprovalMethodPreference,
      state.estimateGasLimit,
      state.addTransaction,
      state.currentMarketData,
    ]);
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setLoadingTxns,
      setApprovalTxState,
      setMainTxState,
      setGasLimit,
      setTxError,
    } = useModalContext();
    const permitAvailable = tryPermit({ reserveAddress: poolAddress, isWrappedBaseAsset });
    const { sendTx } = useWeb3Context();
    const queryClient = useQueryClient();

    const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

    const {
      data: approvedAmountMain,
      refetch: fetchApprovedAmount,
      isRefetching: fetchingApprovedAmount,
      isFetchedAfterMount,
    } = usePoolApprovedAmount(currentMarketData, poolAddress);

    const approvedAmount = isConnectedTonWallet ? approvedAmountTonAssume : approvedAmountMain;

    setLoadingTxns(fetchingApprovedAmount);

    const requiresApproval =
      Number(amountToSupply) !== 0 &&
      checkRequiresApproval({
        approvedAmount: approvedAmount?.amount || '0',
        amount: amountToSupply,
        signedAmount: signatureParams ? signatureParams.amount : '0',
      });

    if (requiresApproval && approvalTxState?.success) {
      // There was a successful approval tx, but the approval amount is not enough.
      // Clear the state to prompt for another approval.
      setApprovalTxState({});
    }

    const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

    const { approval } = useApprovalTx({
      usePermit,
      approvedAmount,
      requiresApproval,
      assetAddress: poolAddress,
      symbol,
      decimals,
      signatureAmount: amountToSupply,
      onApprovalTxConfirmed: fetchApprovedAmount,
      onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
    });

    useEffect(() => {
      if (!isFetchedAfterMount) {
        fetchApprovedAmount();
      }
    }, [fetchApprovedAmount, isFetchedAfterMount]);

    // Update gas estimation
    useEffect(() => {
      let supplyGasLimit = 0;
      if (usePermit) {
        supplyGasLimit = Number(
          gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended
        );
      } else {
        supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
        if (requiresApproval && !approvalTxState.success) {
          supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
        }
      }
      setGasLimit(supplyGasLimit.toString());
    }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);
    const action = async () => {
      try {
        if (isConnectedTonWallet) {
          setMainTxState({ ...mainTxState, loading: true });
          try {
            const resSupplyTop = await onSendSupplyTon(
              parseUnits(valueToBigNumber(amountToSupply).toFixed(decimals), decimals).toString(),
              isJetton
            );
            if (!resSupplyTop?.success) {
              const error = {
                name: 'supply',
                message: resSupplyTop?.error,
              };
              const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
              setTxError(parsedError);
              setMainTxState({
                txHash: undefined,
                loading: false,
              });
            } else {
              await Promise.allSettled([getPoolContractGetReservesData(), getYourSupplies()]);
              setMainTxState({
                txHash: resSupplyTop.txHash,
                loading: false,
                success: true,
                amount: amountToSupply,
              });
            }
          } catch (error) {
            console.log('error supply--------------', error);
          }
        } else {
          setMainTxState({ ...mainTxState, loading: true });

          let response: TransactionResponse;
          let action = ProtocolAction.default;

          // determine if approval is signature or transaction
          // checking user preference is not sufficient because permit may be available but the user has an existing approval
          if (usePermit && signatureParams) {
            action = ProtocolAction.supplyWithPermit;
            let signedSupplyWithPermitTxData = supplyWithPermit({
              signature: signatureParams.signature,
              amount: parseUnits(amountToSupply, decimals).toString(),
              reserve: poolAddress,
              deadline: signatureParams.deadline,
            });

            signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
            response = await sendTx(signedSupplyWithPermitTxData);

            await response.wait(1);
          } else {
            action = ProtocolAction.supply;
            let supplyTxData = supply({
              amount: parseUnits(amountToSupply, decimals).toString(),
              reserve: poolAddress,
            });
            supplyTxData = await estimateGasLimit(supplyTxData);
            response = await sendTx(supplyTxData);

            await response.wait(1);
          }

          setMainTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });

          addTransaction(response.hash, {
            action,
            txState: 'success',
            asset: poolAddress,
            amount: amountToSupply,
            assetName: symbol,
          });

          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    };

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        isWrongNetwork={isWrongNetwork}
        requiresAmount
        amount={amountToSupply}
        symbol={symbol}
        preparingTransactions={loadingTxns || !approvedAmount}
        actionText={<Trans>Supply {symbol}</Trans>}
        actionInProgressText={<Trans>Supplying {symbol}</Trans>}
        handleApproval={approval}
        handleAction={action}
        requiresApproval={requiresApproval}
        tryPermit={permitAvailable}
        sx={sx}
        {...props}
      />
    );
  }
);
