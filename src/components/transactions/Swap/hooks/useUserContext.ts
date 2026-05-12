import { Dispatch, useEffect } from 'react';
import { isEip7702Wallet, isSafeWallet, isSmartContractWallet } from 'src/helpers/provider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';

import { SwapState } from '../types';

export const useUserContext = ({ setState }: { setState: Dispatch<Partial<SwapState>> }) => {
  const user = useRootStore((store) => store.account);
  const { chainId: connectedChainId } = useWeb3Context();

  useEffect(() => {
    try {
      if (user && connectedChainId) {
        setState({ user });
        getEthersProvider(wagmiConfig, { chainId: connectedChainId }).then((provider) => {
          Promise.all([
            isSmartContractWallet(user, provider),
            isSafeWallet(user, provider),
            isEip7702Wallet(user, provider),
          ]).then(([isSmartContract, isSafe, isEip7702]) => {
            setState({ userIsSmartContractWallet: isSmartContract });
            setState({ userIsSafeWallet: isSafe });
            setState({ userIsEip7702Wallet: isEip7702 });
          });
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, connectedChainId]);
};
