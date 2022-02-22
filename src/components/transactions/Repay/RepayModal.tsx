import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { RepayModalContent } from './RepayModalContent';

export const RepayModal = () => {
  const { type, close, args } = useModalContext();

  return (
    <BasicModal open={type === ModalType.Repay} setOpen={close}>
      {args?.underlyingAsset && <RepayModalContent underlyingAsset={args.underlyingAsset} />}
    </BasicModal>
  );
};
