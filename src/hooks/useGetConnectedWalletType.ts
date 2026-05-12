import { useEffect, useState } from 'react';
import {
  isEip7702Wallet as getIsEip7702Wallet,
  isSafeWallet as getIsSafeWallet,
  isSmartContractWallet as getIsSmartContractWallet,
} from 'src/helpers/provider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';

export const useGetConnectedWalletType = () => {
  const { chainId } = useWeb3Context();
  const user = useRootStore((store) => store.account);
  const [isSmartContractWallet, setUserIsSmartContractWallet] = useState(false);
  const [isSafeWallet, setUserIsSafeWallet] = useState(false);
  const [isEip7702Wallet, setUserIsEip7702Wallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    getEthersProvider(wagmiConfig, { chainId })
      .then((provider) => {
        return Promise.all([
          getIsSmartContractWallet(user, provider),
          getIsSafeWallet(user, provider),
          getIsEip7702Wallet(user, provider),
        ]);
      })
      .then(([isSmartContract, isSafe, isEip7702]) => {
        if (cancelled) return;
        setUserIsSmartContractWallet(isSmartContract);
        setUserIsSafeWallet(isSafe);
        setUserIsEip7702Wallet(isEip7702);
      })
      .catch((error) => {
        console.error('Error fetching wallet type:', error);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chainId, user]);

  return { isSmartContractWallet, isSafeWallet, isEip7702Wallet, isLoading };
};
