import { ReactNode } from 'react';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { AddressBlockedModal } from './AddressBlockedModal';

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount, disconnectWallet, readOnlyMode, loading } = useWeb3Context();
  const screenAddress = readOnlyMode || loading || ENABLE_TESTNET ? '' : currentAccount;
  const { isAllowed } = useAddressAllowed(screenAddress);

  if (!isAllowed) {
    return (
      <MainLayout>
        <AddressBlockedModal address={currentAccount} onDisconnectWallet={disconnectWallet} />;
      </MainLayout>
    );
  }

  return <>{children}</>;
};
