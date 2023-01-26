import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { MigrateV3ModalContent } from './MigrateV3ModalContent';

export const MigrateV3Modal = () => {
  const { type, close } = useModalContext();

  return (
    <BasicModal open={type === ModalType.V3Migration} setOpen={close}>
      <MigrateV3ModalContent />
    </BasicModal>
  );
};
