import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { BorrowModalContent } from './CollateralChangeModalContent';

export const CollateralChangeModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.CollateralChange} setOpen={close}>
      {args?.underlyingAsset && (
        <CollateralChangeModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
