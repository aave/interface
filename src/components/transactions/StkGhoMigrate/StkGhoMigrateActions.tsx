import { evmAddress, useStkGhoMigrate } from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { errAsync } from 'neverthrow';
import React, { useEffect } from 'react';
import { oracles, stakedTokens } from 'src/hooks/stake/common';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { useWalletClient } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useShallow } from 'zustand/shallow';

import { TxActionsWrapper } from '../TxActionsWrapper';

// Static recommendation: migrate redeems the full stkGHO position and deposits
// it into the sGHO vault. No approval step exists (the migrator holds the
// stkGHO claim-helper role and redeems on the user's behalf), so this is a safe
// upper bound for the single migrate() call.
const STK_GHO_MIGRATE_GAS_LIMIT = 250_000;

export interface StkGhoMigrateActionsProps extends BoxProps {
  isWrongNetwork: boolean;
  blocked: boolean;
}

export const StkGhoMigrateActions = React.memo(
  ({ isWrongNetwork, blocked, sx, ...props }: StkGhoMigrateActionsProps) => {
    const { currentAccount } = useWeb3Context();
    const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
    const { mainTxState, setMainTxState, setTxError, setGasLimit } = useModalContext();
    const { refresh } = useSGhoVaultContext();
    const queryClient = useQueryClient();
    const [user, marketData] = useRootStore(
      useShallow((state) => [state.account, state.currentMarketData])
    );

    const { data: walletClient } = useWalletClient();
    const [migrate] = useStkGhoMigrate();
    const [sendTransaction] = useSendTransaction(walletClient);

    useEffect(() => {
      setGasLimit(STK_GHO_MIGRATE_GAS_LIMIT.toString());
    }, [setGasLimit]);

    const action = async () => {
      if (!currentAccount || !walletClient) return;
      setMainTxState({ loading: true });
      setTxError(undefined);

      const result = await migrate({
        user: evmAddress(currentAccount),
        chainId: sdkChainId,
      }).andThen((plan) => {
        switch (plan.__typename) {
          case 'TransactionRequest':
            return sendTransaction(plan);
          case 'InsufficientBalanceError':
            return errAsync(new Error('No stkGHO balance available to migrate.'));
          case 'ApprovalRequired':
            return errAsync(
              new Error('Unexpected migration plan; expected a transaction request.')
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

      // Wait for the receipt on the connected chain (works on forks too).
      try {
        await waitForTransactionReceipt(wagmiConfig, {
          hash: submittedTxHash as `0x${string}`,
          chainId: targetChainId,
        });
      } catch (e) {
        console.warn('waitForTransactionReceipt failed', e);
      }

      // Refresh the sGHO vault cache (new shares) and invalidate the stkGHO
      // position + pool balances so both panels reflect the migration.
      refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.userStakeUiData(user, marketData, stakedTokens, oracles),
      });

      setMainTxState({ loading: false, success: true, txHash: submittedTxHash });
    };

    return (
      <TxActionsWrapper
        requiresApproval={false}
        preparingTransactions={false}
        mainTxState={mainTxState}
        isWrongNetwork={isWrongNetwork}
        handleAction={action}
        symbol="stkGHO"
        actionText={<Trans>Proceed with migration</Trans>}
        actionInProgressText={<Trans>Migrating</Trans>}
        sx={sx}
        blocked={blocked}
        {...props}
      />
    );
  }
);

StkGhoMigrateActions.displayName = 'StkGhoMigrateActions';
