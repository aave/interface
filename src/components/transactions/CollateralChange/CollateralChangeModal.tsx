import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { CollateralChangeModalContent } from './CollateralChangeModalContent';

export const CollateralChangeModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.CollateralChange} setOpen={close}>
      {args?.underlyingAsset && (
        <CollateralChangeModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
