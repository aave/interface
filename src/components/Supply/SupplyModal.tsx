import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { SupplyModalContent } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.Supply} setOpen={close}>
      {args?.underlyingAsset && (
        <SupplyModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
