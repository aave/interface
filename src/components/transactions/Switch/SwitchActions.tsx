import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { OptimalRate } from '@paraswap/sdk';
import { queryClient } from 'pages/_app.page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParaswapSellTxParams } from 'src/hooks/paraswap/useParaswapRates';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from '../utils';

interface SwithProps {
  inputAmount: string;
  inputToken: string;
  outputToken: string;
  inputDecimals: number;
  outputDecimals: number;
  slippage: string;
  blocked: boolean;
  loading?: boolean;
  swapper: string;
  isWrongNetwork: boolean;
  chainId: number;
  route: OptimalRate;
}

export const SwitchActions = ({
  inputAmount,
  inputToken,
  inputDecimals,
  outputToken,
  outputDecimals,
  slippage,
  swapper,
  blocked,
  loading,
  isWrongNetwork,
  chainId,
  route,
}: SwithProps) => {
  const [user, generateApproval, estimateGasLimit] = useRootStore((state) => [
    state.account,
    state.generateApproval,
    state.estimateGasLimit,
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

  const { sendTx } = useWeb3Context();

  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
  const { mutateAsync: fetchParaswapTxParams } = useParaswapSellTxParams(chainId);

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      inputAmount === '0' ||
      isWrongNetwork
    )
      return false;
    else return approvedAmount <= Number(inputAmount);
  }, [approvedAmount, inputAmount, isWrongNetwork]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const tx = await fetchParaswapTxParams({
        srcToken: inputToken,
        srcDecimals: inputDecimals,
        destDecimals: outputDecimals,
        destToken: outputToken,
        route,
        user,
        maxSlippage: Number(slippage) * 10000,
      });
      const txWithGasEstimation = await estimateGasLimit(tx, chainId);
      const response = await sendTx(txWithGasEstimation);
      await response.wait(1);
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      console.log(error);
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const approval = async () => {
    try {
      const tx = generateApproval({
        spender: route.tokenTransferProxy,
        user,
        token: inputToken,
        amount: inputAmount,
      });
      const txWithGasEstimation = await estimateGasLimit(tx);
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
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const fetchApprovedAmount = useCallback(async () => {
    setLoadingTxns(true);
    const rpc = getProvider(chainId);
    console.log(rpc);
    const erc20Service = new ERC20Service(rpc);
    console.log(user);
    console.log(inputToken);
    console.log(swapper);
    const approvedTargetAmount = await erc20Service.approvedAmount({
      user,
      token: inputToken,
      spender: route.tokenTransferProxy,
    });
    console.log(approvedAmount);
    setApprovedAmount(approvedTargetAmount);
    setLoadingTxns(false);
  }, [chainId, setLoadingTxns, user, inputToken, swapper]);

  useEffect(() => {
    fetchApprovedAmount();
  }, [fetchApprovedAmount]);

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
      requiresApproval={requiresApproval}
      actionText={<Trans>Switch</Trans>}
      actionInProgressText={<Trans>Switching</Trans>}
      errorParams={{
        loading: false,
        disabled: blocked || !approvalTxState?.success,
        content: <Trans>Switch</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={false}
    />
  );
};
