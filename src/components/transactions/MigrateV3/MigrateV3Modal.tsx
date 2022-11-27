import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { MigrateV3Actions } from './MigrateV3Actions';

export const MigrateV3Modal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.V3Migration} setOpen={close}>
      <MigrateV3Actions />
    </BasicModal>
  );
};
