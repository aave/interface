import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../../components/primitives/BasicModal';
import { TxErrorView } from '../../../components/transactions/FlowCommons/Error';
import { TxSuccessView } from '../../../components/transactions/FlowCommons/Success';
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
