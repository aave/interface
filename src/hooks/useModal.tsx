import { ChainId, Stake } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ActionName, SwapActionFields, TransactionHistoryItem } from 'src/modules/history/types';
import { useRootStore } from 'src/store/root';
import { TxErrorType } from 'src/ui-config/errorMapping';
import { GENERAL } from 'src/utils/events';

import { Proposal } from './governance/useProposals';

export enum ModalType {
  Supply,
  SupplySDK,
  Withdraw,
  WithdrawSDK,
  Borrow,
  BorrowSDK,
  Repay,
  RepaySDK,
  CollateralChange,
  Stake,
  Unstake,
  StakeCooldown,
  StakeRewardClaim,
  ClaimRewards,
  Emode,
  Faucet,
  GovDelegation,
  GovVote,
  V3Migration,
  RevokeGovDelegation,
  StakeRewardsClaimRestake,
  StakingMigrate,
  GovRepresentatives,
  Bridge,
  ReadMode,
  Umbrella,
  UmbrellaStakeCooldown,
  UmbrellaClaim,
  UmbrellaClaimAll,
  UmbrellaUnstake,
  SavingsGhoDeposit,
  SavingsGhoWithdraw,
  CancelCowOrder,

  // Swaps
  Swap,
  CollateralSwap,
  DebtSwap,
  RepayWithCollateral,
  WithdrawAndSwap,
}

export interface ModalArgsType {
  underlyingAsset?: string;
  proposal?: Proposal;
  support?: boolean;
  power?: string;
  icon?: string;
  stakeAssetName?: Stake;
  uStakeToken?: string;
  underlyingTokenAddress?: string;
  isFrozen?: boolean;
  representatives?: Array<{ chainId: ChainId; representative: string }>;
  chainId?: number;
  umbrellaAssetName?: string;
  stataTokenAToken?: string;
  stataTokenAsset?: string;
  cowOrder?: TransactionHistoryItem<SwapActionFields[ActionName.Swap]>;
}

export type TxStateType = {
  txHash?: string;
  // txError?: string;
  loading?: boolean;
  success?: boolean;
};

type CallbackFn = () => void;

export interface ModalContextType<T extends ModalArgsType> {
  openSupply: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string,
    isReserve?: boolean
  ) => void;
  openSupplySDK: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string,
    isReserve?: boolean
  ) => void;
  openWithdraw: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string
  ) => void;
  openWithdrawSDK: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string
  ) => void;
  openBorrow: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string,
    isReserve?: boolean
  ) => void;
  openBorrowSDK: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string,
    isReserve?: boolean
  ) => void;
  openRepay: (
    underlyingAsset: string,
    isFrozen: boolean,
    currentMarket: string,
    name: string,
    funnel: string
  ) => void;
  openRepaySDK: (
    underlyingAsset: string,
    isFrozen: boolean,
    currentMarket: string,
    name: string,
    funnel: string
  ) => void;
  openCollateralChange: (
    underlyingAsset: string,
    currentMarket: string,
    name: string,
    funnel: string,
    usageAsCollateralEnabledOnUser: boolean
  ) => void;
  openStake: (stakeAssetName: Stake, icon: string) => void;
  openUnstake: (stakeAssetName: Stake, icon: string) => void;
  openStakeCooldown: (stakeAssetName: Stake, icon: string) => void;
  openStakeRewardsClaim: (stakeAssetName: Stake, icon: string) => void;
  openStakeRewardsRestakeClaim: (stakeAssetName: Stake, icon: string) => void;
  openUmbrella: (
    uStakeToken: string,
    underlyingTokenAddress: string,
    icon: string,
    stataTokenAToken: string,
    stataTokenAsset: string
  ) => void;
  openUmbrellaStakeCooldown: (uStakeToken: string, icon: string) => void;
  openUmbrellaClaim: (uStakeToken: string) => void;
  openUmbrellaClaimAll: () => void;
  openUmbrellaUnstake: (
    uStakeToken: string,
    underlyingTokenAddress: string,
    stataTokenAsset: string,
    icon: string
  ) => void;
  openClaimRewards: () => void;
  openEmode: () => void;
  openFaucet: (underlyingAsset: string) => void;
  openCollateralSwap: (underlyingAsset: string) => void;
  openDebtSwitch: (underlyingAsset: string) => void;
  openGovDelegation: () => void;
  openRevokeGovDelegation: () => void;
  openV3Migration: () => void;
  openGovVote: (proposal: Proposal, support: boolean, power: string) => void;
  openSwitch: (underlyingAsset?: string, chainId?: number) => void;
  openBridge: () => void;
  openStakingMigrate: () => void;
  openGovRepresentatives: (
    representatives: Array<{ chainId: ChainId; representative: string }>
  ) => void;
  openSavingsGhoDeposit: () => void;
  openSavingsGhoWithdraw: () => void;
  openCancelCowOrder: (
    transaction: TransactionHistoryItem<SwapActionFields[ActionName.Swap]>
  ) => void;
  close: () => void;
  closeWithCb: (callback: CallbackFn) => void;
  type?: ModalType;
  args: T;
  mainTxState: TxStateType;
  approvalTxState: TxStateType;
  setApprovalTxState: (data: TxStateType) => void;
  setMainTxState: (data: TxStateType) => void;
  gasLimit: string;
  setGasLimit: (limit: string) => void;
  loadingTxns: boolean;
  setLoadingTxns: (loading: boolean) => void;
  txError: TxErrorType | undefined;
  setTxError: (error: TxErrorType | undefined) => void;
  openReadMode: () => void;
}

export const ModalContext = createContext<ModalContextType<ModalArgsType>>(
  {} as ModalContextType<ModalArgsType>
);

export const ModalContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { setSwitchNetworkError } = useWeb3Context();
  // contains the current modal open state if any
  const [type, setType] = useState<ModalType>();
  // contains arbitrary key-value pairs as a modal context
  const [args, setArgs] = useState<ModalArgsType>({});
  const [approvalTxState, setApprovalTxState] = useState<TxStateType>({});
  const [mainTxState, setMainTxState] = useState<TxStateType>({});
  const [gasLimit, setGasLimit] = useState<string>('');
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txError, setTxError] = useState<TxErrorType>();
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <ModalContext.Provider
      value={{
        openReadMode: () => {
          setType(ModalType.ReadMode);
        },
        openSupply: (underlyingAsset, currentMarket, name, funnel, isReserve) => {
          setType(ModalType.Supply);
          setArgs({ underlyingAsset });

          if (isReserve) {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'Supply',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          } else {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'Supply',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          }
        },
        openSupplySDK: (underlyingAsset, currentMarket, name, funnel, isReserve) => {
          setType(ModalType.SupplySDK);
          setArgs({ underlyingAsset });

          if (isReserve) {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'SupplySDK',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          } else {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'SupplySDK',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          }
        },
        openWithdraw: (underlyingAsset, currentMarket, name, funnel) => {
          setType(ModalType.Withdraw);
          setArgs({ underlyingAsset });

          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Withdraw',
            market: currentMarket,
            assetName: name,
            asset: underlyingAsset,
            funnel: funnel,
          });
        },
        openWithdrawSDK: (underlyingAsset, currentMarket, name, funnel) => {
          setType(ModalType.WithdrawSDK);
          setArgs({ underlyingAsset });

          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'WithdrawSDK',
            market: currentMarket,
            assetName: name,
            asset: underlyingAsset,
            funnel: funnel,
          });
        },
        openBorrow: (underlyingAsset, currentMarket, name, funnel, isReserve) => {
          setType(ModalType.Borrow);
          setArgs({ underlyingAsset });
          if (isReserve) {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'Borrow',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          } else {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'Borrow',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          }
        },
        openBorrowSDK: (underlyingAsset, currentMarket, name, funnel, isReserve) => {
          setType(ModalType.BorrowSDK);
          setArgs({ underlyingAsset });
          if (isReserve) {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'BorrowSDK',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          } else {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'BorrowSDK',
              market: currentMarket,
              assetName: name,
              asset: underlyingAsset,
              funnel,
            });
          }
        },
        openRepay: (underlyingAsset, isFrozen, currentMarket, name, funnel) => {
          setType(ModalType.Repay);
          setArgs({ underlyingAsset, isFrozen });

          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Repay',
            asset: underlyingAsset,
            assetName: name,
            market: currentMarket,
            funnel,
          });
        },
        openRepaySDK: (underlyingAsset, isFrozen, currentMarket, name, funnel) => {
          setType(ModalType.RepaySDK);
          setArgs({ underlyingAsset, isFrozen });

          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'RepaySDK',
            asset: underlyingAsset,
            assetName: name,
            market: currentMarket,
            funnel,
          });
        },
        openCollateralChange: (
          underlyingAsset,
          currentMarket,
          name,
          funnel,
          usageAsCollateralEnabledOnUser
        ) => {
          setType(ModalType.CollateralChange);
          setArgs({ underlyingAsset });
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Toggle Collateral',
            market: currentMarket,
            assetName: name,
            asset: underlyingAsset,
            usageAsCollateralEnabledOnUser: usageAsCollateralEnabledOnUser,
            funnel,
          });
        },
        openStake: (stakeAssetName, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Stake', assetName: stakeAssetName });
          setType(ModalType.Stake);
          setArgs({ stakeAssetName, icon });
        },
        openUnstake: (stakeAssetName, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Untake', assetName: stakeAssetName });
          setType(ModalType.Unstake);
          setArgs({ stakeAssetName, icon });
        },
        openStakeCooldown: (stakeAssetName, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Cooldown', assetName: stakeAssetName });
          setType(ModalType.StakeCooldown);
          setArgs({ stakeAssetName, icon });
        },
        openStakeRewardsClaim: (stakeAssetName, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Stake Rewards', assetName: stakeAssetName });
          setType(ModalType.StakeRewardClaim);
          setArgs({ stakeAssetName, icon });
        },
        openStakeRewardsRestakeClaim: (stakeAssetName, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Restatke Stake Rewards',
            assetName: stakeAssetName,
          });
          setType(ModalType.StakeRewardsClaimRestake);
          setArgs({ stakeAssetName, icon });
        },
        openUmbrella: (
          uStakeToken,
          underlyingTokenAddress,
          icon,
          stataTokenAToken,
          stataTokenAsset
        ) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Umbrella',
            uStakeToken: uStakeToken,
            stataTokenAToken: stataTokenAToken,
            stataTokenAsset: stataTokenAsset,
          });

          setType(ModalType.Umbrella);
          setArgs({
            uStakeToken,
            underlyingTokenAddress,
            icon,
            stataTokenAToken: stataTokenAToken,
            stataTokenAsset: stataTokenAsset,
          });
        },
        openUmbrellaStakeCooldown: (uStakeToken, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Umbrella Stake Cooldown',
            uStakeToken: uStakeToken,
          });

          setType(ModalType.UmbrellaStakeCooldown);
          setArgs({ uStakeToken, icon });
        },
        openUmbrellaClaim: (uStakeToken) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Umbrella Claim', uStakeToken: uStakeToken });
          setType(ModalType.UmbrellaClaim);
          setArgs({ uStakeToken });
        },
        openUmbrellaClaimAll: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Umbrella Claim All' });
          setType(ModalType.UmbrellaClaimAll);
        },
        openUmbrellaUnstake: (uStakeToken, underlyingTokenAddress, stataTokenAsset, icon) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Umbrella Redeem', uStakeToken: uStakeToken });

          setType(ModalType.UmbrellaUnstake);
          setArgs({ uStakeToken, underlyingTokenAddress, stataTokenAsset, icon });
        },
        openClaimRewards: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Claim' });
          setType(ModalType.ClaimRewards);
        },
        openEmode: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'eMode' });
          setType(ModalType.Emode);
        },
        openFaucet: (underlyingAsset) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Faucet' });
          setType(ModalType.Faucet);
          setArgs({ underlyingAsset });
        },
        openCollateralSwap: (underlyingAsset) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Collateral Swap' });
          setType(ModalType.CollateralSwap);
          setArgs({ underlyingAsset });
        },
        openBridge: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Bridge' });
          setType(ModalType.Bridge);
        },
        openDebtSwitch: (underlyingAsset) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Debt Switch',
            asset: underlyingAsset,
          });
          setType(ModalType.DebtSwap);
          setArgs({ underlyingAsset });
        },
        openGovDelegation: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Governance Delegation' });
          setType(ModalType.GovDelegation);
        },
        openRevokeGovDelegation: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Revoke Governance Delegation' });
          setType(ModalType.RevokeGovDelegation);
        },
        openGovVote: (proposal, support, power) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Vote',
            proposalId: proposal.subgraphProposal.id,
            voteSide: support,
          });
          setType(ModalType.GovVote);
          setArgs({ proposal, support, power });
        },
        openGovRepresentatives: (representatives) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Representatives' });
          setType(ModalType.GovRepresentatives);
          setArgs({ representatives });
        },
        openV3Migration: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'V2->V3 Migration' });
          setType(ModalType.V3Migration);
        },
        openSwitch: (underlyingAsset, chainId) => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Swap' });
          setType(ModalType.Swap);
          setArgs({ underlyingAsset, chainId });
        },
        openStakingMigrate: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Staking V1->V2 Migration' });
          setType(ModalType.StakingMigrate);
        },
        openSavingsGhoDeposit: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Savings GHO Deposit' });
          setType(ModalType.SavingsGhoDeposit);
          setArgs({ underlyingAsset: AaveV3Ethereum.ASSETS.GHO.UNDERLYING.toLowerCase() });
        },
        openSavingsGhoWithdraw: () => {
          trackEvent(GENERAL.OPEN_MODAL, { modal: 'Savings GHO Withdraw' });
          setType(ModalType.SavingsGhoWithdraw);
          setArgs({ underlyingAsset: AaveV3Ethereum.ASSETS.GHO.UNDERLYING.toLowerCase() });
        },
        openCancelCowOrder: (transaction) => {
          trackEvent(GENERAL.OPEN_MODAL, {
            modal: 'Cancel CoW Order',
            orderId: transaction.id,
          });
          setType(ModalType.CancelCowOrder);
          setArgs({ cowOrder: transaction });
        },
        close: () => {
          setType(undefined);
          setArgs({});
          setMainTxState({});
          setApprovalTxState({});
          setGasLimit('');
          setTxError(undefined);
          setSwitchNetworkError(undefined);
        },
        closeWithCb: (callback) => {
          close();
          callback();
        },
        type,
        args,
        approvalTxState,
        mainTxState,
        setApprovalTxState,
        setMainTxState,
        gasLimit,
        setGasLimit,
        loadingTxns,
        setLoadingTxns,
        txError,
        setTxError,
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
