import { useModal } from 'connectkit';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

/**
 * Returns a wrapper that runs `action` when a wallet is connected, or opens the ConnectKit
 * (Family) wallet-connect modal when it isn't. Used by entry points like the header's Swap /
 * Bridge buttons so unauthenticated users go straight to connect instead of a modal's own
 * connect step.
 */
export const useConnectGate = () => {
  const { currentAccount } = useWeb3Context();
  const { setOpen } = useModal();

  return (action: () => void) => {
    if (!currentAccount) {
      setOpen(true);
      return;
    }
    action();
  };
};
