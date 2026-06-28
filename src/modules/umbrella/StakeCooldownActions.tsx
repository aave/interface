import { gasLimitRecommendations, ProtocolAction, StakeTokenService } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  customGasPrice?: string;
  blocked: boolean;
  selectedToken: string;
  amountToCooldown: string;
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  amountToCooldown,
  ...props
}: StakeCooldownActionsProps) => {
  const queryClient = useQueryClient();
  const [user, estimateGasLimit] = useRootStore(
    useShallow((state) => [state.account, state.estimateGasLimit])
  );
  const { sendTx } = useWeb3Context();

  const { mainTxState, loadingTxns, setMainTxState, setTxError, setGasLimit } = useModalContext();

  useEffect(() => {
    const cooldownGasLimit = Number(
      gasLimitRecommendations[ProtocolAction.umbrellaStakeTokenCooldown].recommended
    );
    setGasLimit(cooldownGasLimit.toString());
  }, [setGasLimit]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const stakeTokenService = new StakeTokenService(selectedToken);
      let cooldownTxData = stakeTokenService.cooldown({ sender: user });
      cooldownTxData = await estimateGasLimit(cooldownTxData);
      const tx = await sendTx(cooldownTxData);
      await tx.wait(1);
      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.umbrella });
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
      requiresApproval={false}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Activate Cooldown</Trans>}
      actionInProgressText={<Trans>Activate Cooldown</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
