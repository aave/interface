import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import HelpModalContent from './HelpModalContent';

export function HelpModal() {
  const { type, close } = useModalContext();

  const handleClose = () => {
    close();
    localStorage.setItem('SupplyTour', 'true');
  };

  return (
    <BasicModal open={type === ModalType.Help} setOpen={handleClose} withCloseButton={false}>
      <HelpModalContent />
    </BasicModal>
  );
}
