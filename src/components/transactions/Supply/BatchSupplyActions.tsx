import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { useAccount, useSendCalls } from 'wagmi';
import { useShallow } from 'zustand/shallow';

import { poolAbi } from '../../../libs/abis/pool_abi';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

export interface BatchSupplyActionsProps extends BoxProps {
  amountToSupply: string;
  isWrongNetwork: boolean;
  poolAddress: string;
  symbol: string;
  blocked: boolean;
  decimals: number;
  isWrappedBaseAsset: boolean;
}

export function BatchSupplyActions({
  amountToSupply,
  isWrongNetwork,
  poolAddress,
  symbol,
  blocked,
  decimals,
  isWrappedBaseAsset,
  ...props
}: BatchSupplyActionsProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
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
  const { sendTx } = useWeb3Context();
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const [
    tryPermit,
    supply,
    supplyWithPermit,
    walletApprovalMethodPreference,
    estimateGasLimit,
    addTransaction,
    currentMarketData,
  ] = useRootStore(
    useShallow((state) => [
      state.tryPermit,
      state.supply,
      state.supplyWithPermit,
      state.walletApprovalMethodPreference,
      state.estimateGasLimit,
      state.addTransaction,
      state.currentMarketData,
    ])
  );

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isRefetching: fetchingApprovedAmount,
  } = usePoolApprovedAmount(currentMarketData, poolAddress);

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

  const permitAvailable = tryPermit({ reserveAddress: poolAddress, isWrappedBaseAsset });
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

  const { sendCalls, isPending } = useSendCalls({
    mutation: {
      onSuccess: (hash) => {
        console.log('BATCH HASH', hash);
        addTransaction('batch', {
          action: ProtocolAction.supply,
          txState: 'success',
          asset: poolAddress,
          amount: amountToSupply,
          assetName: symbol,
        });
        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        setMainTxState({ success: true, loading: false,txHash: hash.id });
      },
      onError: (error) => {
        console.log('ERROR', error);
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
      },
    },
  });

  // Update gas estimation
  useEffect(() => {
    let supplyGasLimit = 0;
    if (walletApprovalMethodPreference === ApprovalMethod.BATCH) {
      supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
      if (requiresApproval) {
        supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
      }
    } else if (usePermit) {
      supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended);
    } else {
      supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
      if (requiresApproval && !approvalTxState.success) {
        supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
      }
    }
    setGasLimit(supplyGasLimit.toString());
  }, [requiresApproval, approvalTxState, usePermit, walletApprovalMethodPreference, setGasLimit]);

  const handleSupply = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      if (walletApprovalMethodPreference === ApprovalMethod.BATCH) {
        const calls = [];

        if (requiresApproval) {
          const approveData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [currentMarketData.addresses.LENDING_POOL as `0x${string}`, parseUnits(amountToSupply, decimals)],
          });
          calls.push({
            to: poolAddress,
            data: approveData,
          });
        }

        const supplyData = encodeFunctionData({
          abi: poolAbi,
          functionName: 'supply',
          args: [
            poolAddress as `0x${string}`,
            parseUnits(amountToSupply, decimals),
            address || '0x0',
            0,
          ],
        });
        calls.push({
          to: currentMarketData.addresses.LENDING_POOL,
          data: supplyData,
        });

        sendCalls({
          calls,
        });
      } else {
        let response: TransactionResponse;
        let action = ProtocolAction.default;

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

          addTransaction(response.hash, {
            action: ProtocolAction.supplyWithPermit,
            txState: 'success',
            asset: poolAddress,
            amount: amountToSupply,
            assetName: symbol,
          });

          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        } else {
          action = ProtocolAction.supply;
          let supplyTxData = supply({
            amount: parseUnits(amountToSupply, decimals).toString(),
            reserve: poolAddress,
          });
          supplyTxData = await estimateGasLimit(supplyTxData);
          response = await sendTx(supplyTxData);

          await response.wait(1);

          addTransaction(response.hash, {
            action,
            txState: 'success',
            asset: poolAddress,
            amount: amountToSupply,
            assetName: symbol,
          });

          queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
        }

        setMainTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
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
      blocked={blocked || Number(amountToSupply) === 0}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      amount={amountToSupply}
      symbol={symbol}
      preparingTransactions={loadingTxns || !approvedAmount || isPending}
      actionText={<Trans>Supply {symbol}</Trans>}
      actionInProgressText={<Trans>Supplying {symbol}</Trans>}
      handleApproval={approval}
      handleAction={handleSupply}
      requiresApproval={requiresApproval && walletApprovalMethodPreference !== ApprovalMethod.BATCH}
      tryPermit={permitAvailable}
      showBatchOption={true}
      sx={props.sx}
    />
  );
}
