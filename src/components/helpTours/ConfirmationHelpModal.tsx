import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { ConfirmationHelpModalContent } from './ConfirmationHelpModalContent';

export const ConfirmationHelpModal = () => {
  const { type, close } = useModalContext();

  const handleClose = () => {
    close();
  };

  return (
    <BasicModal
      open={type === ModalType.ConfirmationHelp}
      setOpen={handleClose}
      withCloseButton={false}
    >
      <ConfirmationHelpModalContent />
    </BasicModal>
  );
};
