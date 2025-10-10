import { useEffect, useState } from 'react';
import {
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

  useEffect(() => {
    try {
      getEthersProvider(wagmiConfig, { chainId }).then((provider) => {
        Promise.all([
          getIsSmartContractWallet(user, provider),
          getIsSafeWallet(user, provider),
        ]).then(([isSmartContract, isSafe]) => {
          setUserIsSmartContractWallet(isSmartContract);
          setUserIsSafeWallet(isSafe);
        });
      });
    } catch (error) {
      console.error('Error fetching wallet type:', error);
    }
  }, [chainId, user]);

  return { isSmartContractWallet, isSafeWallet };
};
