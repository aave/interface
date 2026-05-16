import { bigDecimal, evmAddress, useSghoVaultDeposit } from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { errAsync } from 'neverthrow';
import React, { useEffect } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { useWalletClient } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from '../utils';

// TODO: add to gasLimitRecommendations once the Aave SDK adds vault entries.
// Observed deposit cost on mainnet: ~94k gas used / 150k limit (Tenderly trace).
const SGHO_VAULT_DEPOSIT_GAS_LIMIT = 150_000;

export interface SGhoVaultDepositActionsProps extends BoxProps {
  amount: string;
  isWrongNetwork: boolean;
  blocked: boolean;
}

export const SGhoVaultDepositActions = React.memo(
  ({ amount, isWrongNetwork, blocked, sx, ...props }: SGhoVaultDepositActionsProps) => {
    const { currentAccount } = useWeb3Context();
    const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
    const { mainTxState, setMainTxState, setTxError, setGasLimit } = useModalContext();
    const { refresh } = useSGhoVaultContext();
    const queryClient = useQueryClient();

    const { data: walletClient } = useWalletClient();
    const [deposit] = useSghoVaultDeposit();
    const [sendTransaction] = useSendTransaction(walletClient);

    // Push a static gas recommendation to the modal context. We don't yet
    // know whether the plan will require an ERC20 approval (would need a
    // `useSghoVaultDepositPlan` wiring to detect ApprovalRequired) — until
    // then, always include the approval bump so the displayed fee is a safe
    // upper bound. Drops to base when we wire approval-aware state.
    useEffect(() => {
      setGasLimit((SGHO_VAULT_DEPOSIT_GAS_LIMIT + APPROVAL_GAS_LIMIT).toString());
    }, [setGasLimit]);

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
      // Temp workaround: wait after the refresh() for the request to fire so it goes through
      refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Also invalidate the React Query 'pool' subtree which covers
      // useWalletBalances → the user's GHO wallet balance.
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });

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
