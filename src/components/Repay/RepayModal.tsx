import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { RepayModalContent } from './RepayModalContent';

export const RepayModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.Repay} setOpen={close}>
      {args?.underlyingAsset && (
        <RepayModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
