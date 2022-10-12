import { PERMISSION, PermissionManager } from '@aave/contract-helpers';
import React, { useContext, useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getProvider, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { useProtocolDataContext } from './useProtocolDataContext';

type PermissionsContext = {
  permissions: PERMISSION[];
  isPermissionsLoading: boolean;
};

const Context = React.createContext<PermissionsContext>({
  permissions: [],
  isPermissionsLoading: false,
});

export const PermissionProvider: React.FC = ({ children }) => {
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount: walletAddress } = useWeb3Context();
  const [isPermissionsLoading, setIsPermissionsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<PERMISSION[]>([]);

  async function getPermissionData(permissionManagerAddress: string) {
    try {
      const instance = new PermissionManager({
        provider: getProvider(chainId),
        permissionManagerAddress: permissionManagerAddress,
      });
      const permissions = await instance.getHumanizedUserPermissions(walletAddress);
      setIsPermissionsLoading(true);
      setPermissions(permissions);
    } catch (e) {
      throw new Error('there was an error fetching your permissions');
    }
    setIsPermissionsLoading(false);
  }

  useEffect(() => {
    if (
      isFeatureEnabled.permissions(currentMarketData) &&
      walletAddress &&
      currentMarketData.addresses.PERMISSION_MANAGER
    ) {
      getPermissionData(currentMarketData.addresses.PERMISSION_MANAGER);
    } else {
      setIsPermissionsLoading(false);
    }
  }, [walletAddress, currentMarketData.addresses.PERMISSION_MANAGER]);

  return (
    <Context.Provider
      value={{
        permissions,
        isPermissionsLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const usePermissions = () => useContext(Context);
