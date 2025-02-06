import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { constants, PopulatedTransaction } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
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
import { queryKeysFactory } from 'src/ui-config/queries';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { stakeUmbrellaConfig } from './services/StakeDataProviderService';
import { StakeGatewayService } from './services/StakeGatewayService';
import { StakeTokenService } from './services/StakeTokenService';
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

  const useStakeGateway = stakeData.underlyingIsWaToken;

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: currentChainId,
    token: selectedToken.address,
    spender: useStakeGateway
      ? stakeUmbrellaConfig[currentChainId].stakeGateway
      : stakeData.stakeToken,
  });

  setLoadingTxns(fetchingApprovedAmount);

  const amountWithMargin = Number(amountToStake) + Number(amountToStake) * 0.1;
  const amountToApprove =
    isMaxSelected && selectedToken.aToken
      ? roundToTokenDecimals(amountWithMargin.toString(), stakeData.decimals)
      : amountToStake;

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
    spender: useStakeGateway
      ? stakeUmbrellaConfig[currentChainId].stakeGateway
      : stakeData.stakeToken,
    amount: approvedAmount?.toString() || '0',
  };

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount: tokenApproval,
    requiresApproval,
    assetAddress: selectedToken.address,
    symbol: selectedToken.symbol,
    decimals: stakeData.decimals,
    amountToApprove:
      !amountToApprove || isNaN(+amountToApprove)
        ? '0'
        : parseUnits(amountToApprove, stakeData.decimals).toString(),
    onApprovalTxConfirmed: fetchApprovedAmount,
    signatureAmount: amountToApprove,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const { currentAccount, sendTx } = useWeb3Context();

  const action = async () => {
    const parsedAmountToStake = parseUnits(amountToStake, stakeData.decimals).toString();
    const parsedBalance = parseUnits(selectedToken.balance, stakeData.decimals).toString();
    let amount = parsedAmountToStake;
    if (isMaxSelected) {
      if (selectedToken.aToken) {
        amount = constants.MaxUint256.toString();
      } else {
        amount = parsedBalance;
      }
    }

    try {
      let stakeTxData: PopulatedTransaction;

      if (useStakeGateway) {
        stakeTxData = getStakeGatewayTxData(amount);
      } else {
        stakeTxData = getStakeTokenTxData(amount);
      }

      stakeTxData = await estimateGasLimit(stakeTxData);
      const tx = await sendTx(stakeTxData);

      await tx.wait(1);

      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
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
    }
  };

  const getStakeGatewayTxData = (amountToStake: string) => {
    setMainTxState({ ...mainTxState, loading: true });
    const stakeService = new StakeGatewayService(stakeUmbrellaConfig[currentChainId].stakeGateway);
    let stakeTxData: PopulatedTransaction;

    if (usePermit && signatureParams) {
      if (selectedToken.aToken) {
        stakeTxData = stakeService.stakeATokenWithPermit(
          currentAccount,
          stakeData.stakeToken,
          parseUnits(
            roundToTokenDecimals(amountWithMargin.toString(), stakeData.decimals),
            stakeData.decimals
          ).toString(),
          signatureParams.deadline,
          signatureParams.signature
        );
      } else {
        stakeTxData = stakeService.stakeWithPermit(
          user,
          stakeData.stakeToken,
          amountToStake,
          signatureParams.deadline,
          signatureParams.signature
        );
      }
    } else {
      if (selectedToken.aToken) {
        stakeTxData = stakeService.stakeAToken(currentAccount, stakeData.stakeToken, amountToStake);
      } else {
        stakeTxData = stakeService.stake(currentAccount, stakeData.stakeToken, amountToStake);
      }
    }

    return stakeTxData;
  };

  const getStakeTokenTxData = (amountToStake: string) => {
    const stakeTokenService = new StakeTokenService(stakeData.stakeToken);
    let stakeTxData: PopulatedTransaction;

    if (usePermit && signatureParams) {
      stakeTxData = stakeTokenService.stakeWithPermit(
        user,
        amountToStake,
        signatureParams.deadline,
        signatureParams.signature
      );
    } else {
      stakeTxData = stakeTokenService.stake(user, amountToStake);
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
