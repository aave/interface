import { ReactNode } from 'react';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';
import { useDisconnect } from 'wagmi';

import { AddressBlockedModal } from './AddressBlockedModal';

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount, readOnlyMode, loading } = useWeb3Context();
  const { disconnect } = useDisconnect();
  const screenAddress = readOnlyMode || loading || ENABLE_TESTNET ? '' : currentAccount;
  const { isAllowed } = useAddressAllowed(screenAddress);

  if (!isAllowed) {
    return (
      <MainLayout>
        <AddressBlockedModal address={currentAccount} onDisconnectWallet={disconnect} />;
      </MainLayout>
    );
  }

  return <>{children}</>;
};
