import { bigDecimal, evmAddress, useSghoVaultDeposit } from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { errAsync } from 'neverthrow';
import React from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { useWalletClient } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { TxActionsWrapper } from '../TxActionsWrapper';

export interface SGhoVaultDepositActionsProps extends BoxProps {
  amount: string;
  isWrongNetwork: boolean;
  blocked: boolean;
}

export const SGhoVaultDepositActions = React.memo(
  ({ amount, isWrongNetwork, blocked, sx, ...props }: SGhoVaultDepositActionsProps) => {
    const { currentAccount } = useWeb3Context();
    const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
    const { mainTxState, setMainTxState, setTxError } = useModalContext();
    const { refresh } = useSGhoVaultContext();

    const { data: walletClient } = useWalletClient();
    const [deposit] = useSghoVaultDeposit();
    const [sendTransaction] = useSendTransaction(walletClient);

    const action = async () => {
      if (!currentAccount || !walletClient || !amount) return;
      setMainTxState({ loading: true });
      setTxError(undefined);

      const result = await deposit({
        amount: { value: bigDecimal(amount) },
        depositor: evmAddress(currentAccount),
        chainId: sdkChainId,
      }).andThen((plan) => {
        switch (plan.__typename) {
          case 'TransactionRequest':
            return sendTransaction(plan);
          case 'ApprovalRequired':
            return sendTransaction(plan.approval).andThen(() =>
              sendTransaction(plan.originalTransaction)
            );
          case 'InsufficientBalanceError':
            return errAsync(
              new Error(`Insufficient balance: ${plan.required.value} GHO required.`)
            );
        }
      });

      if (result.isErr()) {
        setMainTxState({ loading: false });
        setTxError({
          blocking: true,
          actionBlocked: true,
          rawError: result.error as Error,
          error: <span>{(result.error as Error).message}</span>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          txAction: 0 as any,
        });
        return;
      }

      const submittedTxHash = result.value;
      setMainTxState({ loading: true, txHash: submittedTxHash });

      // Wait for the receipt on the actually-connected chain (works on forks too,
      // unlike client.waitForTransaction which only polls the Aave production indexer).
      try {
        await waitForTransactionReceipt(wagmiConfig, {
          hash: submittedTxHash as `0x${string}`,
          chainId: targetChainId,
        });
      } catch (e) {
        // tx is broadcast; receipt fetch failed (timeout, RPC blip). Don't block
        // the success view — the user can verify on-chain if needed.
        console.warn('waitForTransactionReceipt failed', e);
      }

      // Repopulate the shared SGhoVault cache so other consumers (header,
      // card, withdraw modal) reflect the new balances on close.
      refresh();

      setMainTxState({ loading: false, success: true, txHash: submittedTxHash });
    };

    return (
      <TxActionsWrapper
        requiresApproval={false}
        preparingTransactions={false}
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        handleAction={action}
        symbol="GHO"
        requiresAmount
        actionText={<Trans>Deposit</Trans>}
        actionInProgressText={<Trans>Depositing</Trans>}
        sx={sx}
        blocked={blocked}
        {...props}
      />
    );
  }
);

SGhoVaultDepositActions.displayName = 'SGhoVaultDepositActions';
