import { createContext, useContext, useState } from 'react';

export enum ModalType {
  Supply,
  Withdraw,
  Borrow,
  Repay,
  CollateralChange,
  RateSwitch,
  ClaimRewards,
  Emode,
  Faucet,
  Swap,
}

interface ModalContextType {
  openSupply: (underlyingAsset: string) => void;
  openWithdraw: (underlyingAsset: string) => void;
  openBorrow: (underlyingAsset: string) => void;
  openRepay: (underlyingAsset: string) => void;
  openCollateralChange: (underlyingAsset: string) => void;
  openRateSwitch: (underlyingAsset: string) => void;
  openClaimRewards: () => void;
  openEmode: () => void;
  openFaucet: (underlyingAsset: string) => void;
  openSwap: (underlyingAsset: string) => void;
  close: () => void;
  type?: ModalType;
  args?: { [key: string]: string };
}

export const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider: React.FC = ({ children }) => {
  // contains the current modal open state if any
  const [type, setType] = useState<ModalType>();
  // contains arbitrary key-value pairs as a modal context
  const [args, setArgs] = useState<{ [key: string]: string }>({});
  return (
    <ModalContext.Provider
      value={{
        openSupply: (underlyingAsset) => {
          setType(ModalType.Supply);
          setArgs({ underlyingAsset });
        },
        openWithdraw: (underlyingAsset) => {
          setType(ModalType.Withdraw);
          setArgs({ underlyingAsset });
        },
        openBorrow: (underlyingAsset) => {
          setType(ModalType.Borrow);
          setArgs({ underlyingAsset });
        },
        openRepay: (underlyingAsset) => {
          setType(ModalType.Repay);
          setArgs({ underlyingAsset });
        },
        openCollateralChange: (underlyingAsset) => {
          setType(ModalType.CollateralChange);
          setArgs({ underlyingAsset });
        },
        openRateSwitch: (underlyingAsset) => {
          setType(ModalType.RateSwitch);
          setArgs({ underlyingAsset });
        },
        openClaimRewards: () => {
          setType(ModalType.ClaimRewards);
        },
        openEmode: () => {
          setType(ModalType.Emode);
        },
        openFaucet: (underlyingAsset) => {
          setType(ModalType.Faucet);
          setArgs({ underlyingAsset });
        },
        openSwap: (underlyingAsset) => {
          setType(ModalType.Swap);
          setArgs({ underlyingAsset });
        },
        close: () => {
          setType(undefined);
          setArgs({});
        },
        type,
        args,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }

  return context;
};
