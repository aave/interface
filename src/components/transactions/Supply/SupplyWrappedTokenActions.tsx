import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { queryClient } from 'pages/_app.page';
import { useEffect, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useSupplyDaiAsSavingsDai } from 'src/hooks/useSavingsDai';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

interface SupplyWrappedTokenActionProps extends BoxProps {
  tokenIn: string;
  amountToSupply: string;
  decimals: number;
  symbol: string;
}
export const SupplyWrappedTokenActions = ({
  tokenIn,
  amountToSupply,
  decimals,
  symbol,
  sx,
  ...props
}: SupplyWrappedTokenActionProps) => {
  const [
    currentMarketData,
    tryPermit,
    walletApprovalMethodPreference,
    estimateGasLimit,
    addTransaction,
  ] = useRootStore((state) => [
    state.currentMarketData,
    state.tryPermit,
    state.walletApprovalMethodPreference,
    state.estimateGasLimit,
    state.addTransaction,
  ]);

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setApprovalTxState,
    setLoadingTxns,
    setMainTxState,
    setTxError,
    setGasLimit,
  } = useModalContext();

  const { sendTx } = useWeb3Context();

  const { refetchPoolData } = useBackgroundDataProvider();

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isRefetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = useApprovedAmount({
    spender: currentMarketData.addresses.SDAI_TOKEN_WRAPPER || '',
    token: tokenIn,
  });

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

  setLoadingTxns(fetchingApprovedAmount);

  const permitAvailable = tryPermit(tokenIn);
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const { supply, supplyWithPermit } = useSupplyDaiAsSavingsDai();

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount,
    requiresApproval,
    assetAddress: tokenIn,
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
  let supplyGasLimit = 0;
  if (usePermit) {
    supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended);
  } else {
    supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
    if (requiresApproval && !approvalTxState.success) {
      supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
    }
  }

  setGasLimit(supplyGasLimit.toString());

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      let action = ProtocolAction.default;

      // determine if approval is signature or transaction
      // checking user preference is not sufficient because permit may be available but the user has an existing approval
      if (usePermit && signatureParams) {
        action = ProtocolAction.supplyWithPermit;
        let signedSupplyWithPermitTxData = supplyWithPermit(
          parseUnits(amountToSupply, decimals).toString(),
          signatureParams.deadline,
          signatureParams.signature
        );

        signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
        response = await sendTx(signedSupplyWithPermitTxData);

        await response.wait(1);
      } else {
        action = ProtocolAction.supply;
        let supplyTxData = supply(parseUnits(amountToSupply, decimals).toString());
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
        asset: tokenIn,
        amount: amountToSupply,
        assetName: symbol,
      });

      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      refetchPoolData && refetchPoolData();
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
      blocked={false} // TODO
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={false} // TODO
      requiresAmount
      amount={amountToSupply}
      symbol={symbol}
      preparingTransactions={loadingTxns}
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
};
