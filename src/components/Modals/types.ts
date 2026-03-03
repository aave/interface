export enum ModalType {
  Wallet = 'Wallet',
  ClaimRewards = 'ClaimRewards',
  SupplySuccess = 'SupplySuccess',
  Withdraw = 'Withdraw',
  Borrow = 'Borrow',
  Repay = 'Repay',
}

export interface WalletModalProps {
  address: string;
}

export interface ClaimRewardsModalProps {}

export interface SupplySuccessModalProps {
  amount: string;
  token: string;
}

export interface WithdrawModalProps {
  token: string;
  balance: string;
}

export interface BorrowModalProps {
  token: string;
  available: string;
}

export interface RepayModalProps {
  token: string;
  balance: string;
}

export interface ModalPropsMap {
  [ModalType.Wallet]: WalletModalProps;
  [ModalType.ClaimRewards]: ClaimRewardsModalProps;
  [ModalType.SupplySuccess]: SupplySuccessModalProps;
  [ModalType.Withdraw]: WithdrawModalProps;
  [ModalType.Borrow]: BorrowModalProps;
  [ModalType.Repay]: RepayModalProps;
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}
