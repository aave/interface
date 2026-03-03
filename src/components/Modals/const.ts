import { ComponentType, lazy } from 'react';

import { BaseModalProps, ModalPropsMap, ModalType } from './types';

type ModalComponent<T extends ModalType> = ComponentType<BaseModalProps & ModalPropsMap[T]>;

export const MODAL_COMPONENTS: { [K in ModalType]: React.LazyExoticComponent<ModalComponent<K>> } =
  {
    [ModalType.Wallet]: lazy(() => import('./WalletModal')),
    [ModalType.ClaimRewards]: lazy(() => import('./ClaimRewardsModal')),
    [ModalType.SupplySuccess]: lazy(() => import('./SupplySuccessModal')),
    [ModalType.Withdraw]: lazy(() => import('./WithdrawModal')),
    [ModalType.Borrow]: lazy(() => import('./BorrowModal')),
    [ModalType.Repay]: lazy(() => import('./RepayModal')),
  };

export const WALLET_ADDRESS = '0x5678901234567890123456789012345678906810';
