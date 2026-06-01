import { Dispatch, useEffect } from 'react';
import { isEip7702Wallet, isSafeWallet, isSmartContractWallet } from 'src/helpers/provider';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';

import { SwapState } from '../types';

// Detect on the swap's target chain, not the wallet's currently connected chain.
// EIP-7702 delegation is per-chain (the authorization tuple includes chainId), so
// a user can be 7702 on the swap chain while connected to a different one.
// Checking the wrong chain would misclassify and route through CoW.
export const useUserContext = ({
  chainId,
  setState,
}: {
  chainId: number;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const user = useRootStore((store) => store.account);

  useEffect(() => {
    if (!user || !chainId) return;

    let cancelled = false;
    setState({ user });

    getEthersProvider(wagmiConfig, { chainId })
      .then((provider) =>
        Promise.all([
          isSmartContractWallet(user, provider),
          isSafeWallet(user, provider),
          isEip7702Wallet(user, provider),
        ])
      )
      .then(([isSmartContract, isSafe, isEip7702]) => {
        if (cancelled) return;
        setState({
          userIsSmartContractWallet: isSmartContract,
          userIsSafeWallet: isSafe,
          userIsEip7702Wallet: isEip7702,
        });
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [user, chainId]);
};
