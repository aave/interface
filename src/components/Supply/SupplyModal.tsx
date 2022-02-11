import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { BasicModal } from '../primitives/BasicModal';
import { SupplyModalContent } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      {args?.underlyingAsset && (
        <SupplyModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
