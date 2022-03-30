import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useTransactionHandler } from '../../../helpers/useTransactionHandler';
import { useStakeTxBuilderContext } from 'src/hooks/useStakeTxBuilder';
import { TxActionsWrapper } from '../TxActionsWrapper';

export interface UnStakeActionProps extends BoxProps {
  amountToUnStake: string;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  symbol: string;
  blocked: boolean;
  selectedToken: string;
}

export const UnStakeActions = ({
  amountToUnStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: UnStakeActionProps) => {
  const { currentAccount } = useWeb3Context();
  const stakingService = useStakeTxBuilderContext(selectedToken);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return stakingService.redeem(currentAccount, amountToUnStake.toString());
    },
    skip: !amountToUnStake || parseFloat(amountToUnStake) === 0 || blocked,
    deps: [amountToUnStake],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToUnStake}
      actionText={<Trans>UNSTAKE {symbol}</Trans>}
      actionInProgressText={<Trans>UNSTAKING {symbol}</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  );
};
