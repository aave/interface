import { SghoVaultDepositQuery, SghoVaultRedeemSharesQuery } from '@aave/graphql';
import { type ChainId, type EvmAddress, bigDecimal } from '@aave/react';
import { useQuery } from 'urql';

/**
 * Fetches the deposit ExecutionPlan from the Aave v3 GraphQL backend without
 * actually submitting the transaction. Useful for showing gas estimates,
 * approval-required state, and InsufficientBalanceError before the user clicks.
 *
 * Talks to urql directly (same reason as `useSGhoVaultContext`) — the SDK's
 * `useSghoVaultDeposit` is an action hook designed to fire-and-submit, not
 * to react to input changes.
 *
 * Returns the raw `useQuery` tuple `[{ data, fetching, error, stale }, reexecuteQuery]`
 * so callers can use any urql primitive (e.g. `reexecuteQuery({ requestPolicy: 'network-only' })`).
 *
 * TODO: debounce `amount` upstream (e.g. 300–500ms) before passing into this
 * hook to avoid hitting the backend on every keystroke.
 */
export const useSghoVaultDepositPlan = ({
  amount,
  depositor,
  chainId,
}: {
  amount: string;
  depositor: EvmAddress;
  chainId: ChainId;
}) => {
  const hasAmount = parseFloat(amount) > 0;

  return useQuery({
    query: SghoVaultDepositQuery,
    variables: {
      request: {
        amount: { value: bigDecimal(hasAmount ? amount : '0') },
        depositor,
        chainId,
      },
    },
    pause: !hasAmount,
  });
};

/**
 * Fetches the redeem-shares ExecutionPlan from the Aave v3 GraphQL backend
 * without submitting. See `useSghoVaultDepositPlan` for the rationale.
 */
export const useSghoVaultRedeemSharesPlan = ({
  amount,
  isMax,
  sharesOwner,
  chainId,
}: {
  amount: string;
  isMax: boolean;
  sharesOwner: EvmAddress;
  chainId: ChainId;
}) => {
  const hasAmount = isMax || parseFloat(amount) > 0;

  const amountInput = isMax
    ? { maxRedeem: true as const }
    : { shares: bigDecimal(hasAmount ? amount : '0') };

  return useQuery({
    query: SghoVaultRedeemSharesQuery,
    variables: {
      request: {
        amount: amountInput,
        sharesOwner,
        chainId,
      },
    },
    pause: !hasAmount,
  });
};
