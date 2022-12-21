import { ReactNode } from 'react';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { AddressBlockedModal } from './AddressBlockedModal';

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount, disconnectWallet, watchModeOnly, loading } = useWeb3Context();
  const screenAddress = watchModeOnly || loading ? '' : currentAccount;
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
