import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { OptimalRate } from '@paraswap/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { defaultAbiCoder, formatUnits, splitSignature } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from '../utils';

interface SwithProps {
  inputAmount: string;
  inputToken: string;
  outputToken: string;
  slippage: string;
  blocked: boolean;
  loading?: boolean;
  isWrongNetwork: boolean;
  chainId: number;
  route?: OptimalRate;
  inputName: string;
  outputName: string;
}

interface SignedParams {
  signature: string;
  deadline: string;
  amount: string;
  approvedToken: string;
}

export const SwitchActions = ({
  inputAmount,
  inputToken,
  inputName,
  outputName,
  outputToken,
  slippage,
  blocked,
  loading,
  isWrongNetwork,
  chainId,
  route,
}: SwithProps) => {
  const [
    user,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    addTransaction,
    currentMarketData,
  ] = useRootStore((state) => [
    state.account,
    state.generateApproval,
    state.estimateGasLimit,
    state.walletApprovalMethodPreference,
    state.generateSignatureRequest,
    state.addTransaction,
    state.currentMarketData,
  ]);

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
  const networkConfig = getNetworkConfig(chainId);

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
  const { mutateAsync: fetchParaswapTxParams } = useParaswapSellTxParams(
    networkConfig.underlyingChainId ?? chainId
  );
  const tryPermit = permitByChainAndToken[chainId]?.[inputToken];

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT && tryPermit;

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

  const action = async () => {
    if (route) {
      try {
        setMainTxState({ ...mainTxState, loading: true });
        const tx = await fetchParaswapTxParams({
          srcToken: inputToken,
          srcDecimals: route.srcDecimals,
          destDecimals: route.destDecimals,
          destToken: outputToken,
          route,
          user,
          maxSlippage: Number(slippage) * 10000,
          permit: signatureParams && signatureParams.signature,
          deadline: signatureParams && signatureParams.deadline,
          partner: 'aave-widget',
        });
        tx.chainId = chainId;
        const txWithGasEstimation = await estimateGasLimit(tx, chainId);
        const response = await sendTx(txWithGasEstimation);
        const txData = {
          action: 'switch',
          asset: route.srcToken,
          assetName: inputName,
          amount: formatUnits(route.srcAmount, route.srcDecimals),
          amountUsd: route.srcUSD,
          outAsset: route.destToken,
          outAmount: formatUnits(route.destAmount, route.destDecimals),
          outAmountUsd: route.destUSD,
          outAssetName: outputName,
        };
        try {
          await response.wait(1);
          addTransaction(
            response.hash,
            {
              txState: 'success',
              ...txData,
            },
            {
              chainId,
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
              ...txData,
            },
            {
              chainId,
            }
          );
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };

  const approval = async () => {
    if (route) {
      const amountToApprove = calculateSignedAmount(inputAmount, route.srcDecimals, 0);
      const approvalData = {
        spender: route.tokenTransferProxy,
        user,
        token: inputToken,
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
            { chainId }
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
          const tx = generateApproval(approvalData, { chainId, amount: amountToApprove });
          const txWithGasEstimation = await estimateGasLimit(tx, chainId);
          setApprovalTxState({ ...approvalTxState, loading: true });
          const response = await sendTx(txWithGasEstimation);
          await response.wait(1);
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
          fetchApprovedAmount();
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };

  const fetchApprovedAmount = useCallback(async () => {
    if (route?.tokenTransferProxy) {
      setSignatureParams(undefined);
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
        token: inputToken,
        spender: route.tokenTransferProxy,
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    }
  }, [chainId, setLoadingTxns, user, inputToken, route?.tokenTransferProxy, setApprovalTxState]);

  useEffect(() => {
    if (user) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, user]);

  useEffect(() => {
    let switchGasLimit = 0;
    switchGasLimit = Number(gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended);
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVAL_GAS_LIMIT);
    }
    setGasLimit(switchGasLimit.toString());
  }, [requiresApproval, approvalTxState, setGasLimit]);

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
      actionText={<Trans>Switch</Trans>}
      actionInProgressText={<Trans>Switching</Trans>}
      errorParams={{
        loading: false,
        disabled: blocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Switch</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={tryPermit}
    />
  );
};
