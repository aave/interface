import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { HelpModalSupplyContent } from './HelpSupplyModalContent';

export const HelpSupplyModal = () => {
  const { type, close, openConfirmationHelp } = useModalContext();

  const handleClose = () => {
    close();
    openConfirmationHelp();
  };

  return (
    <BasicModal open={type === ModalType.SupplyHelp} setOpen={handleClose}>
      <HelpModalSupplyContent />
    </BasicModal>
  );
};
