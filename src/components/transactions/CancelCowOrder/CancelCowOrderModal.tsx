import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionName, SwapActionFields, TransactionHistoryItem } from 'src/modules/history/types';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { CancelCowOrderModalContent } from './CancelCowOrderModalContent';

export const CancelCowOrderModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    cowOrder: TransactionHistoryItem<
      | SwapActionFields[ActionName.Swap]
      | SwapActionFields[ActionName.CollateralSwap]
      | SwapActionFields[ActionName.DebtSwap]
      | SwapActionFields[ActionName.RepayWithCollateral]
      | SwapActionFields[ActionName.WithdrawAndSwap]
    >;
  }>;
  return (
    <BasicModal open={type === ModalType.CancelCowOrder} setOpen={close}>
      <TxModalTitle title={`Cancel order`} />
      <CancelCowOrderModalContent cowOrder={args.cowOrder} />
    </BasicModal>
  );
};
