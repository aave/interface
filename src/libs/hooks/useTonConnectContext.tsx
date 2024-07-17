import { createContext, useContext } from 'react';

import { TonConnectData } from '../ton-connect-provider/TonConnectProvider';

export type TonConnectContextData = {
  tonConnectProviderData: TonConnectData;
};

export const TonConnectContext = createContext({} as TonConnectContextData);

export const useTonConnectContext = () => {
  const { tonConnectProviderData } = useContext(TonConnectContext);
  if (Object.keys(tonConnectProviderData).length === 0) {
    throw new Error('useTonConnectContext must be used within a TonConnectProvide');
  }

  return tonConnectProviderData;
};
