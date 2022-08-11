import { ReactNode } from 'react';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { AddressBlockedModal } from './AddressBlockedModal';

export const AddressBlocked = ({ children }: { children: ReactNode }) => {
  const { currentAccount } = useWeb3Context();
  const { isAllowed } = useAddressAllowed();

  if (!isAllowed) {
    return <AddressBlockedModal address={currentAccount} />;
  }

  return <>{children}</>;
};
