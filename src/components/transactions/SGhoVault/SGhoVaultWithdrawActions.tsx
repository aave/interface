import { bigDecimal, evmAddress, useSghoVaultRedeemShares } from '@aave/react';
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

// TODO: add to gasLimitRecommendations once the Aave SDK adds vault entries.
// ERC-4626 redeem is typically slightly cheaper than deposit (no
// safeTransferFrom into the vault); using a conservative 120k.
const SGHO_VAULT_REDEEM_GAS_LIMIT = 120_000;

export interface SGhoVaultWithdrawActionsProps extends BoxProps {
  amount: string;
  isMaxSelected: boolean;
  isWrongNetwork: boolean;
  blocked: boolean;
}

export const SGhoVaultWithdrawActions = React.memo(
  ({
    amount,
    isMaxSelected,
    isWrongNetwork,
    blocked,
    sx,
    ...props
  }: SGhoVaultWithdrawActionsProps) => {
    const { currentAccount } = useWeb3Context();
    const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
    const { mainTxState, setMainTxState, setTxError, setGasLimit } = useModalContext();
    const { refresh } = useSGhoVaultContext();
    const queryClient = useQueryClient();

    const { data: walletClient } = useWalletClient();
    const [redeem] = useSghoVaultRedeemShares();
    const [sendTransaction] = useSendTransaction(walletClient);

    // Push a static gas recommendation to the modal context. Redeeming shares
    // never needs an ERC20 approval (the user already owns the shares being
    // burned), so no approval bump.
    useEffect(() => {
      setGasLimit(SGHO_VAULT_REDEEM_GAS_LIMIT.toString());
    }, [setGasLimit]);

    const action = async () => {
      if (!currentAccount || !walletClient || !amount) return;
      setMainTxState({ loading: true });
      setTxError(undefined);

      const amountInput = isMaxSelected
        ? { maxRedeem: true as const }
        : { shares: bigDecimal(amount) };

      const result = await redeem({
        amount: amountInput,
        sharesOwner: evmAddress(currentAccount),
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
              new Error(`Insufficient sGHO balance: ${plan.required.value} required.`)
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
      // card, deposit modal) reflect the new balances on close.
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
        symbol="sGHO"
        requiresAmount
        actionText={<Trans>Withdraw</Trans>}
        actionInProgressText={<Trans>Withdrawing</Trans>}
        sx={sx}
        blocked={blocked}
        {...props}
      />
    );
  }
);

SGhoVaultWithdrawActions.displayName = 'SGhoVaultWithdrawActions';
