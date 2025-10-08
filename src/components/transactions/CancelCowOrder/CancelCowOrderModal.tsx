import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionFields, TransactionHistoryItem } from 'src/modules/history/types';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { CancelCowOrderModalContent } from './CancelCowOrderModalContent';

export const CancelCowOrderModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    cowOrder: TransactionHistoryItem<ActionFields['CowSwap']>;
  }>;
  return (
    <BasicModal open={type === ModalType.CancelCowOrder} setOpen={close}>
      <TxModalTitle title={`Cancel order`} />
      <CancelCowOrderModalContent cowOrder={args.cowOrder} />
    </BasicModal>
  );
};
