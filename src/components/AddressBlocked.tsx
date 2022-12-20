import { ReactNode } from 'react';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { AddressBlockedModal } from './AddressBlockedModal';

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount, disconnectWallet, watchModeOnly } = useWeb3Context();
  const screenAddress = watchModeOnly ? '' : currentAccount;
  const { isAllowed } = useAddressAllowed(screenAddress);
  console.log('isAllowed', isAllowed);
  if (!isAllowed) {
    return (
      <MainLayout>
        <AddressBlockedModal address={currentAccount} onDisconnectWallet={disconnectWallet} />;
      </MainLayout>
    );
  }

  return <>{children}</>;
};
