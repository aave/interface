import { useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { TonConnectContext } from 'src/libs/hooks/useTonConnectContext';

export type TonConnectData = {
  isConnectedTonWallet: boolean;
  walletAddressTonWallet: string;
  disconnectTonWallet: () => void;
  connectTonWallet: () => void;
  loadingTonWallet: boolean;
  deactivatedTonWallet: boolean;
};

export const TonConnectContextProvider: React.FC<{
  children: ReactElement;
}> = ({ children }) => {
  const [isConnectedTonWallet, setIsConnectedTonWallet] = useState<boolean>(false);
  const [walletAddressTonWallet, setWalletAddressTonWallet] = useState<string>('');
  const [loadingTonWallet, setLoadingTonWallet] = useState<boolean>(false);
  const [deactivatedTonWallet, setDeactivatedTonWallet] = useState<boolean>(false);
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (wallet) {
      setIsConnectedTonWallet(true);
      setWalletAddressTonWallet(userFriendlyAddress);
    } else {
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [wallet, userFriendlyAddress]);

  const disconnectTonWallet = useCallback(async () => {
    setLoadingTonWallet(true);
    if (tonConnectUI) {
      tonConnectUI.disconnect();
      setLoadingTonWallet(false);
      setDeactivatedTonWallet(true);
      setIsConnectedTonWallet(false);
      setWalletAddressTonWallet('');
    }
  }, [tonConnectUI]);

  const connectTonWallet = useCallback(async () => {
    if (tonConnectUI) {
      tonConnectUI.openModal();
    }
  }, [tonConnectUI]);

  return (
    <TonConnectContext.Provider
      value={{
        tonConnectProviderData: {
          isConnectedTonWallet,
          walletAddressTonWallet,
          disconnectTonWallet,
          connectTonWallet,
          loadingTonWallet,
          deactivatedTonWallet,
        },
      }}
    >
      {children}
    </TonConnectContext.Provider>
  );
};
