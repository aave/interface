import React, { useContext, useMemo } from 'react';

import { Web3Data } from '../web3-data-provider/Web3ContextProvider';

export type Web3ContextData = {
  web3ProviderData: Web3Data;
};

export const Web3Context = React.createContext({} as Web3ContextData);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (Object.keys(web3Context).length === 0) {
    throw new Error(
      'useWeb3Context() can only be used inside of <Web3ContextProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  const { web3ProviderData } = web3Context;
  return useMemo<Web3Data>(() => {
    return { ...web3ProviderData };
  }, [web3ProviderData]);
};
