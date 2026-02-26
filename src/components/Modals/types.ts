export enum ModalType {
  Wallet = 'Wallet',
}

export interface WalletModalProps {
  address: string;
}

export interface ModalPropsMap {
  [ModalType.Wallet]: WalletModalProps;
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}
