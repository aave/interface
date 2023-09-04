import React from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { SwitchModalContent } from './SwitchModalContent';

export const SwitchModal = () => {
  const { type, close } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      <SwitchModalContent />
    </BasicModal>
  );
};
