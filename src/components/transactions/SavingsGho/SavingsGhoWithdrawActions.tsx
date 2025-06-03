// import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import React, { useEffect } from 'react';
import { oracles, stakedTokens } from 'src/hooks/stake/common';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface UnStakeActionProps extends BoxProps {
  amountToUnStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
  stakeData: StakeTokenFormatted;
  stakeUserData: GetUserStakeUIDataHumanized['stakeUserData'][0];
}

export const SavingsGhoWithdrawActions = ({
  amountToUnStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  stakeData,
  stakeUserData,
  ...props
}: UnStakeActionProps) => {
  const [redeem, cooldown, user, marketData] = useRootStore(
    useShallow((state) => [state.redeem, state.cooldown, state.account, state.currentMarketData])
  );
  const now = useCurrentTimestamp(1);
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const { mainTxState, setMainTxState, setTxError, setGasLimit, loadingTxns } = useModalContext();

  // Cooldown logic
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
  const userCooldown = stakeUserData?.userCooldownTimestamp || 0;
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;

  const userCooldownDelta = now - userCooldown;
  const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;
  const isUnstakeWindowActive =
    isCooldownActive &&
    userCooldownDelta > stakeCooldownSeconds &&
    userCooldownDelta < stakeUnstakeWindow + stakeCooldownSeconds;

  const cooldownRequired = BigNumber.from(parseEther(amountToUnStake || '0')).gt(
    stakeUserData.userCooldownAmount
  );

  // Update gas estimation
  useEffect(() => {
    let gasLimit = 0;
    if (isUnstakeWindowActive) {
      gasLimit = 115000; //TODO: add to utils gasLimitRecommendations
    } else {
      gasLimit = 55000; //TODO: add to utils gasLimitRecommendations
    }
    setGasLimit(gasLimit.toString());
  }, [isUnstakeWindowActive, setGasLimit]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      let response: TransactionResponse;

      if (!isUnstakeWindowActive || cooldownRequired) {
        // First activate cooldown
        const cooldownTxData = await cooldown(selectedToken);
        const tx = await cooldownTxData[0].tx();
        response = await sendTx(tx);

        await response.wait(1);

        await queryClient.invalidateQueries({
          queryKey: queryKeysFactory.userStakeUiData(user, marketData, stakedTokens, oracles),
        });

        // Don't set success state here, just update loading
        setMainTxState({
          txHash: response.hash,
          loading: false,
        });

        return;
      }

      const redeemTxData = await redeem(selectedToken)(amountToUnStake.toString());
      const tx = await redeemTxData[0].tx();
      response = await sendTx(tx);

      await response.wait(1);

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.userStakeUiData(user, marketData, stakedTokens, oracles),
      });

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const actionText =
    isUnstakeWindowActive && !cooldownRequired ? (
      <Trans>Withdraw GHO</Trans>
    ) : (
      <Trans>Activate Cooldown</Trans>
    );

  const actionInProgressText =
    isUnstakeWindowActive && !cooldownRequired ? (
      <Trans>Withdrawing GHO</Trans>
    ) : (
      <Trans>Activating Cooldown</Trans>
    );

  return (
    <TxActionsWrapper
      requiresApproval={false}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToUnStake}
      actionText={actionText}
      actionInProgressText={actionInProgressText}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
