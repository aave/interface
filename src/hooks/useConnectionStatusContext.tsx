import React, { useContext, useEffect, useState } from 'react';
import { APOLLO_QUERY_TARGET, useGraphValid } from 'src/utils/apolloClient';

import { useProtocolDataContext } from './useProtocolDataContext';

export enum ConnectionMode {
  normal = 'normal',
  rpc = 'rpc',
}

export interface ConnectionStatusProviderData {
  preferredConnectionMode: ConnectionMode;
  changePreferredConnectionMode: () => void;
  isRPCMandatory: boolean;
  isRPCActive: boolean;
}

const ConnectionStatusDataContext = React.createContext({} as ConnectionStatusProviderData);

export const ConnectionStatusProvider: React.FC = ({ children }) => {
  const { currentMarketData, currentMarket } = useProtocolDataContext();
  const RPC_ONLY_MODE = !!currentMarketData.rpcOnly;
  const [preferredConnectionMode, setPreferredConnectionMode] = useState<ConnectionMode>(
    RPC_ONLY_MODE ? ConnectionMode.rpc : ConnectionMode.normal
  );

  // restore previous state from local storage
  useEffect(() => {
    if (!RPC_ONLY_MODE) {
      setPreferredConnectionMode(
        (localStorage.getItem('connectionMode') as ConnectionMode) || ConnectionMode.normal
      );
    }
  }, [RPC_ONLY_MODE]);

  const changePreferredConnectionMode = () =>
    !RPC_ONLY_MODE &&
    setPreferredConnectionMode((mode) => {
      const nextMode = mode === ConnectionMode.rpc ? ConnectionMode.normal : ConnectionMode.rpc;
      localStorage.setItem('connectionMode', nextMode);
      return nextMode;
    });

  useEffect(() => {
    console.log('RPC_ONLY_MODE_ENABLED', RPC_ONLY_MODE);
  }, [RPC_ONLY_MODE]);

  const graphValid = useGraphValid(APOLLO_QUERY_TARGET.MARKET(currentMarket));
  const isRPCMandatory = RPC_ONLY_MODE || !graphValid;
  const isRPCActive = preferredConnectionMode === ConnectionMode.rpc || isRPCMandatory;
  return (
    <ConnectionStatusDataContext.Provider
      value={{
        preferredConnectionMode,
        changePreferredConnectionMode,
        isRPCMandatory,
        isRPCActive,
      }}
    >
      {children}
    </ConnectionStatusDataContext.Provider>
  );
};

export const useConnectionStatusContext = () => useContext(ConnectionStatusDataContext);
