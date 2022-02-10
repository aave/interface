import { createContext, useContext, useState } from 'react';

export enum ModalType {
  Supply,
  Withdraw,
  Borrow,
  Repay,
  CollateralChange,
  RateSwitch,
  Stake,
  Unstake,
  Cooldown,
  ClaimStakeRewards,
}

interface ModalContextType {
  openSupply: (underlyingAsset: string) => void;
  openWithdraw: (underlyingAsset: string) => void;
  openBorrow: (underlyingAsset: string) => void;
  openRepay: (underlyingAsset: string) => void;
  openCollateralChange: (underlyingAsset: string) => void;
  openRateSwitch: (underlyingAsset: string) => void;
  openStake: (stakeAsset: string, stakeAssetName: string, icon: string) => void;
  openUnstake: (stakeAsset: string, stakeAssetName: string, icon: string) => void;
  openCooldown: (stakeAsset: string, stakeAssetName: string, icon: string) => void;
  openClaimStakeRewards: () => void;
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
        openStake: (stakeAsset, stakeAssetName, icon) => {
          setType(ModalType.Stake);
          setArgs({ stakeAsset, stakeAssetName, icon });
        },
        openUnstake: (stakeAsset, stakeAssetName, icon) => {
          setType(ModalType.Unstake);
          setArgs({ stakeAsset, stakeAssetName, icon });
        },
        openCooldown: (stakeAsset, stakeAssetName, icon) => {
          setType(ModalType.Cooldown);
          setArgs({ stakeAsset, stakeAssetName, icon });
        },
        openClaimStakeRewards: () => {
          setType(ModalType.ClaimStakeRewards);
          setArgs({});
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
