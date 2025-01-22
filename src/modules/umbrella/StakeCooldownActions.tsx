import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useRootStore } from 'src/store/root';
import { StakeTokenSercie } from './services/StakeTokenService';
import { useModalContext } from 'src/hooks/useModal';
import { useShallow } from 'zustand/shallow';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { useQueryClient } from '@tanstack/react-query';

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

  const { mainTxState, loadingTxns, setMainTxState, setTxError } = useModalContext();

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const stakeTokenService = new StakeTokenSercie(selectedToken);
      let cooldownTxData = stakeTokenService.cooldown(user);
      cooldownTxData = await estimateGasLimit(cooldownTxData);
      const tx = await sendTx(cooldownTxData);
      await tx.wait(1);
      setMainTxState({
        txHash: tx.hash,
        loading: false,
        success: true,
      });

      queryClient.invalidateQueries({ queryKey: ['umbrella'] });
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
