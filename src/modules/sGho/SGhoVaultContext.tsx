import { type SghoVault, SghoVaultQuery } from '@aave/graphql';
import { evmAddress } from '@aave/react';
import { createContext, PropsWithChildren, useCallback, useContext } from 'react';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useQuery } from 'urql';

type SGhoVaultContextValue = {
  vault: SghoVault | undefined;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
};

const SGhoVaultContext = createContext<SGhoVaultContextValue | undefined>(undefined);

export const SGhoVaultProvider = ({ children }: PropsWithChildren) => {
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

  return (
    <SGhoVaultContext.Provider
      value={{
        vault: data?.value,
        loading: fetching && !data,
        refreshing: fetching && !!data,
        refresh,
      }}
    >
      {children}
    </SGhoVaultContext.Provider>
  );
};

export const useSGhoVaultContext = () => {
  const context = useContext(SGhoVaultContext);

  if (!context) {
    throw new Error('useSGhoVaultContext must be used within an SGhoVaultProvider');
  }

  return context;
};
