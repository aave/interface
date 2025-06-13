import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  ProtocolAction,
  StakeTokenService,
  UmbrellaBatchHelperService,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { PopulatedTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from 'src/components/transactions/utils';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { stakeUmbrellaConfig } from 'src/services/UmbrellaStakeDataService';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { StakeInputAsset } from './UmbrellaModalContent';

export interface StakeActionProps extends BoxProps {
  amountToStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  stakeData: MergedStakeData;
  selectedToken: StakeInputAsset;
  event: string;
  isMaxSelected: boolean;
}

export const UmbrellaActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  event,
  stakeData,
  isMaxSelected,
  ...props
}: StakeActionProps) => {
  const queryClient = useQueryClient();
  const [
    estimateGasLimit,
    tryPermit,
    walletApprovalMethodPreference,
    currentMarket,
    addTransaction,
  ] = useRootStore(
    useShallow((state) => [
      state.estimateGasLimit,
      state.tryPermit,
      state.walletApprovalMethodPreference,
      state.currentMarket,
      state.addTransaction,
    ])
  );

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

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

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const permitAvailable =
    selectedToken.aToken ||
    tryPermit({
      reserveAddress: selectedToken.address,
      isWrappedBaseAsset: selectedToken.address === API_ETH_MOCK_ADDRESS,
    });
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const useStakeGateway = stakeData.underlyingIsStataToken;

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: currentChainId,
    token: selectedToken.address,
    spender: useStakeGateway
      ? stakeUmbrellaConfig[currentMarket]?.batchHelper || ''
      : stakeData.tokenAddress,
  });

  setLoadingTxns(fetchingApprovedAmount);

  const amountWithMargin = Number(amountToStake) + Number(amountToStake) * 0.1;
  const addMargin = selectedToken.aToken && isMaxSelected;
  const amount = addMargin ? amountWithMargin.toString() : amountToStake;

  const requiresApproval =
    Number(amountToStake) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.toString() || '0',
      amount,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  if (requiresApproval && approvalTxState?.success) {
    // There was a successful approval tx, but the approval amount is not enough.
    // Clear the state to prompt for another approval.
    setApprovalTxState({});
  }

  const tokenApproval = {
    user,
    token: selectedToken.address,
    spender: useStakeGateway
      ? stakeUmbrellaConfig[currentMarket]?.batchHelper || ''
      : stakeData.tokenAddress,
    amount: approvedAmount?.toString() || '0',
  };

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount: tokenApproval,
    requiresApproval,
    assetAddress: selectedToken.address,
    symbol: selectedToken.symbol,
    decimals: stakeData.decimals,
    amountToApprove: parseUnits(amount || '0', stakeData.decimals).toString(),
    onApprovalTxConfirmed: fetchApprovedAmount,
    signatureAmount: amount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const { currentAccount, sendTx } = useWeb3Context();

  useEffect(() => {
    let stakeGasLimit = Number(gasLimitRecommendations[ProtocolAction.umbrellaStake].recommended);
    if (usePermit) {
      stakeGasLimit = Number(
        gasLimitRecommendations[ProtocolAction.umbrellaStakeWithPermit].recommended
      );
    } else {
      if (requiresApproval && !approvalTxState.success) {
        stakeGasLimit += Number(APPROVAL_GAS_LIMIT);
      }
    }
    setGasLimit(stakeGasLimit.toString());
  }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

  const action = async () => {
    const parsedAmountToStake = parseUnits(amount, stakeData.decimals).toString();

    try {
      let stakeTxData: PopulatedTransaction;

      if (useStakeGateway) {
        stakeTxData = getStakeGatewayTxData(parsedAmountToStake);
      } else {
        stakeTxData = getStakeTokenTxData(parsedAmountToStake);
      }

      stakeTxData = await estimateGasLimit(stakeTxData);
      const tx = await sendTx(stakeTxData);

      await tx.wait(1);

      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });

      // transaction tracking for umbrella staking
      addTransaction(tx.hash, {
        txState: 'success',
        action: ProtocolAction.umbrellaStake,
        amount: amountToStake,
        assetName: selectedToken.symbol,
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.umbrella });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });

      // Add transaction tracking for failed umbrella staking
      if (error && error.hash) {
        addTransaction(error.hash, {
          txState: 'failed',
          action: ProtocolAction.umbrellaStake,
          amount: amountToStake,
          assetName: selectedToken.symbol,
        });
      }
    }
  };

  const getStakeGatewayTxData = (amountToStake: string) => {
    setMainTxState({ ...mainTxState, loading: true });
    const batchHelperService = new UmbrellaBatchHelperService(
      stakeUmbrellaConfig[currentMarket]?.batchHelper || ''
    );
    let stakeTxData: PopulatedTransaction;

    if (usePermit && signatureParams) {
      stakeTxData = batchHelperService.depositWithPermit({
        sender: currentAccount,
        stakeToken: stakeData.tokenAddress,
        amount: amountToStake,
        edgeToken: selectedToken.address,
        deadline: signatureParams.deadline,
        permit: signatureParams.signature,
      });
    } else {
      stakeTxData = batchHelperService.deposit({
        sender: currentAccount,
        stakeToken: stakeData.tokenAddress,
        amount: amountToStake,
        edgeToken: selectedToken.address,
      });
    }

    return stakeTxData;
  };

  const getStakeTokenTxData = (amountToStake: string) => {
    const stakeTokenService = new StakeTokenService(stakeData.tokenAddress);
    let stakeTxData: PopulatedTransaction;

    if (usePermit && signatureParams) {
      stakeTxData = stakeTokenService.depositWithPermit({
        sender: user,
        amount: amountToStake,
        deadline: signatureParams.deadline,
        permit: signatureParams.signature,
      });
    } else {
      stakeTxData = stakeTokenService.deposit({ sender: user, amount: amountToStake });
    }

    return stakeTxData;
  };

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      amount={amountToStake}
      handleAction={action}
      handleApproval={approval}
      symbol={symbol}
      requiresAmount
      actionText={<Trans>Stake</Trans>}
      tryPermit={permitAvailable}
      actionInProgressText={<Trans>Staking</Trans>}
      sx={sx}
      blocked={blocked}
      // event={STAKE.STAKE_BUTTON_MODAL}
      {...props}
    />
  );
};
