import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { BorrowModalContent } from './BorrowModalContent';

export const BorrowModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      {args?.underlyingAsset && (
        <BorrowModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
