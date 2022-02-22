import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { EmodeModalContent } from './EmodeModalContent';

export const EmodeModal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Emode} setOpen={close}>
      <EmodeModalContent />
    </BasicModal>
  );
};
