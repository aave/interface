import { type SghoVault, SghoVaultQuery } from '@aave/graphql';
import { evmAddress } from '@aave/react';
import { useCallback } from 'react';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useQuery } from 'urql';

/**
 * Fetches the sGHO vault state for the current user on the savings target chain.
 *
 * Talks to urql directly (not the SDK's `useSghoVault`) because the SDK's read
 * hooks don't expose a `refetch` — and we need explicit `refresh()` after a
 * deposit / withdraw to repopulate TVL, share price, and the user position.
 *
 * Multiple call sites share data via urql's cache: same query + variables ⇒
 * single network request, every subscriber sees the same data and the same
 * `refresh()` invalidation propagates to all of them.
 */
export const useSGhoVaultContext = () => {
  const { currentAccount } = useWeb3Context();
  const { sdkChainId } = useSavingsMarketData();
  const user = currentAccount ? evmAddress(currentAccount) : evmAddress(ZERO_ADDRESS);

  const [{ data, fetching }, reexecuteQuery] = useQuery({
    query: SghoVaultQuery,
    variables: {
      request: { chainId: sdkChainId, user },
    },
  });

  const refresh = useCallback(() => {
    reexecuteQuery({ requestPolicy: 'network-only' });
  }, [reexecuteQuery]);

  return {
    vault: data?.value as SghoVault | undefined,
    loading: fetching && !data,
    refreshing: fetching && !!data,
    refresh,
  };
};
