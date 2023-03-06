import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { AirdropModalContent } from './AirdropModalContent';

export const AirdropModal = () => {
  const { type, close, txError, mainTxState } = useModalContext();

  if (txError) {
    return (
      <BasicModal open={type === ModalType.AirDrop} setOpen={close}>
        <TxErrorView txError={txError} />
      </BasicModal>
    );
  }

  if (mainTxState.success) {
    return (
      <BasicModal open={type === ModalType.AirDrop} setOpen={close}>
        <TxSuccessView />
      </BasicModal>
    );
  }

  return (
    <BasicModal open={type === ModalType.AirDrop} setOpen={close}>
      <AirdropModalContent />
    </BasicModal>
  );
};
