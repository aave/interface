import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { constants, PopulatedTransaction } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { checkRequiresApproval } from 'src/components/transactions/utils';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useShallow } from 'zustand/shallow';

import { StakeGatewayService } from './services/StakeGatewayService';
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

const STAKE_GATEWAY_CONTRACT = '0x0E467CeF974b0D46141F1698116b2085E529f7eF';

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
  const [estimateGasLimit, tryPermit, walletApprovalMethodPreference] = useRootStore(
    useShallow((state) => [
      state.estimateGasLimit,
      state.tryPermit,
      state.walletApprovalMethodPreference,
    ])
  );

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setLoadingTxns,
    // setApprovalTxState,
    setMainTxState,
    // setGasLimit,
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

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: currentChainId,
    token: selectedToken.address,
    spender: STAKE_GATEWAY_CONTRACT,
  });

  setLoadingTxns(fetchingApprovedAmount);

  const parsedAmountToStake = parseUnits(amountToStake, stakeData.decimals);
  const parsedBalance = parseUnits(selectedToken.balance, stakeData.decimals);

  const bufferBalanceAmount = parsedBalance.div(10).add(parsedBalance);

  const amountToApprove = isMaxSelected
    ? (selectedToken.aToken ? bufferBalanceAmount.toString() : parsedBalance.toString()).toString()
    : parsedAmountToStake.toString();

  const requiresApproval =
    Number(amountToStake) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.toString() || '0',
      amount: amountToApprove,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  const tokenApproval = {
    user,
    token: selectedToken.address,
    spender: STAKE_GATEWAY_CONTRACT,
    amount: amountToApprove,
  };

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount: tokenApproval,
    requiresApproval,
    assetAddress: selectedToken.address,
    symbol: selectedToken.symbol,
    decimals: stakeData.decimals,
    amountToApprove,
    onApprovalTxConfirmed: fetchApprovedAmount,
    signatureAmount: formatUnits(amountToApprove, stakeData.decimals).toString(),
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const { currentAccount, sendTx } = useWeb3Context();

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const stakeService = new StakeGatewayService(STAKE_GATEWAY_CONTRACT);
      let stakeTxData: PopulatedTransaction;

      if (usePermit && signatureParams) {
        if (selectedToken.aToken) {
          stakeTxData = stakeService.stakeATokenWithPermit(
            currentAccount,
            stakeData.stakeToken,
            isMaxSelected ? constants.MaxUint256.toString() : parsedAmountToStake.toString(),
            signatureParams.deadline,
            signatureParams.signature
          );
        } else {
          stakeTxData = stakeService.stakeWithPermit(
            user,
            stakeData.stakeToken,
            isMaxSelected ? parsedBalance.toString() : parsedAmountToStake.toString(),
            signatureParams.deadline,
            signatureParams.signature
          );
        }
      } else {
        if (selectedToken.aToken) {
          stakeTxData = stakeService.stakeAToken(
            currentAccount,
            stakeData.stakeToken,
            isMaxSelected
              ? constants.MaxUint256.toString()
              : parseUnits(amountToStake, stakeData.decimals).toString()
          );
        } else {
          stakeTxData = stakeService.stake(
            currentAccount,
            stakeData.stakeToken,
            isMaxSelected
              ? parseUnits(selectedToken.balance, stakeData.decimals).toString()
              : parseUnits(amountToStake, stakeData.decimals).toString()
          );
        }
      }
      stakeTxData = await estimateGasLimit(stakeTxData);
      const tx = await sendTx(stakeTxData);
      await tx.wait(1);
      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });

      // addTransaction(response.hash, {
      //   action,
      //   txState: 'success',
      //   asset: poolAddress,
      //   amount: amountToSupply,
      //   assetName: symbol,
      // });

      // queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
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
      // event={STAKE.STAKE_BUTTON_MODAL}
      {...props}
    />
  );
};
