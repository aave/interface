import { PropsWithChildren, useEffect, useRef } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useAccount } from 'wagmi';

/**
 * WalletGuard Provider
 * 
 * Monitors wallet connection state and automatically closes modals
 * when the wallet disconnects to prevent crashes and stale state.
 * 
 * This prevents the app from crashing when users lock their wallet
 * extensions (MetaMask, Rabby, Ambire, etc.) while modals are open.
 */
export const WalletGuard = ({ children }: PropsWithChildren) => {
  const { isConnected } = useAccount();
  const { close } = useModalContext();
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    // Track if wallet was previously connected
    if (isConnected) {
      wasConnectedRef.current = true;
      return;
    }

    // Only close modals if wallet was connected and now disconnected
    // This prevents closing modals on initial load
    if (wasConnectedRef.current && !isConnected) {
      console.debug('[WalletGuard] Wallet disconnected, closing modals');
      close();
      // Reset transaction states are handled by the close function
      wasConnectedRef.current = false;
    }
  }, [isConnected, close]);

  return <>{children}</>;
};