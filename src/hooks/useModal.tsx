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
  StakeCooldown,
  StakeRewardClaim,
  ClaimRewards,
  Emode,
  Faucet,
  GovDelegation,
  GovVote,
}

export type ModalArgsType = {
  underlyingAsset?: string;
  proposalId?: number;
  support?: boolean;
  power?: string;
  icon?: string;
  stakeAssetName?: string;
};

export type TxStateType = {
  txHash?: string;
  txError?: string;
  gasEstimationError?: string;
  loading?: boolean;
  success?: boolean;
};

interface ModalContextType {
  openSupply: (underlyingAsset: string) => void;
  openWithdraw: (underlyingAsset: string) => void;
  openBorrow: (underlyingAsset: string) => void;
  openRepay: (underlyingAsset: string) => void;
  openCollateralChange: (underlyingAsset: string) => void;
  openRateSwitch: (underlyingAsset: string) => void;
  openStake: (stakeAssetName: string, icon: string) => void;
  openUnstake: (stakeAssetName: string, icon: string) => void;
  openStakeCooldown: (stakeAssetName: string) => void;
  openStakeRewardsClaim: (stakeAssetName: string) => void;
  openClaimRewards: () => void;
  openEmode: () => void;
  openFaucet: (underlyingAsset: string) => void;
  openGovDelegation: () => void;
  openGovVote: (proposalId: number, support: boolean, power: string) => void;
  close: () => void;
  type?: ModalType;
  args?: ModalArgsType;
  mainTxState: TxStateType;
  approvalTxState: TxStateType;
  setApprovalTxState: (data: TxStateType) => void;
  setMainTxState: (data: TxStateType) => void;
  gasLimit: string;
  setGasLimit: (limit: string) => void;
  resetTx: () => void;
}

export const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalContextProvider: React.FC = ({ children }) => {
  // contains the current modal open state if any
  const [type, setType] = useState<ModalType>();
  // contains arbitrary key-value pairs as a modal context
  const [args, setArgs] = useState<ModalArgsType>({});
  const [approvalTxState, setApprovalTxState] = useState<TxStateType>({});
  const [mainTxState, setMainTxState] = useState<TxStateType>({});
  const [gasLimit, setGasLimit] = useState<string>('');

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
        openStake: (stakeAssetName, icon) => {
          setType(ModalType.Stake);
          setArgs({ stakeAssetName, icon });
        },
        openUnstake: (stakeAssetName, icon) => {
          setType(ModalType.Unstake);
          setArgs({ stakeAssetName, icon });
        },
        openStakeCooldown: (stakeAssetName) => {
          setType(ModalType.StakeCooldown);
          setArgs({ stakeAssetName });
        },
        openStakeRewardsClaim: (stakeAssetName) => {
          setType(ModalType.StakeRewardClaim);
          setArgs({ stakeAssetName });
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
        openGovDelegation: () => {
          setType(ModalType.GovDelegation);
        },
        openGovVote: (proposalId, support, power) => {
          setType(ModalType.GovVote);
          setArgs({ proposalId, support, power });
        },
        close: () => {
          setType(undefined);
          setArgs({});
          setMainTxState({});
          setApprovalTxState({});
          setGasLimit('');
        },
        resetTx: () => {
          setMainTxState({});
          setApprovalTxState({});
          setGasLimit('');
        },
        type,
        args,
        approvalTxState,
        mainTxState,
        setApprovalTxState,
        setMainTxState,
        gasLimit,
        setGasLimit,
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
