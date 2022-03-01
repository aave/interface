import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export type WalletModalContextType = {
  isWalletModalOpen: boolean;
  setWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const WalletModalContext = createContext<WalletModalContextType>(
  {} as WalletModalContextType
);

export const WalletModalContextProvider: React.FC = ({ children }) => {
  const { connected } = useWeb3Context();

  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    if (connected) {
      setWalletModalOpen(false);
    }
  }, [connected]);

  return (
    <WalletModalContext.Provider
      value={{
        isWalletModalOpen,
        setWalletModalOpen,
      }}
    >
      {children}
    </WalletModalContext.Provider>
  );
};

export const useWalletModalContext = () => {
  const context = useContext(WalletModalContext);

  if (context === undefined) {
    throw new Error('useWalletModalContext must be used within a WalletModalProvider');
  }

  return context;
};
