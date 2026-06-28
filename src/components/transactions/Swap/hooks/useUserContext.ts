import { Dispatch, useEffect } from 'react';
import { isSafeWallet, isSmartContractWallet } from 'src/helpers/provider';
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
          Promise.all([isSmartContractWallet(user, provider), isSafeWallet(user, provider)]).then(
            ([isSmartContract, isSafe]) => {
              setState({ userIsSmartContractWallet: isSmartContract });
              setState({ userIsSafeWallet: isSafe });
            }
          );
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, connectedChainId]);
};
