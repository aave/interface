import React from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { HelpModalSupplyContent } from './HelpSupplyModalContent';
import { HelpModalWithdrawContent } from './HelpWithdrawModalContent';

export const HelpMobileModal = () => {
  const { type, close, openConfirmationHelp } = useModalContext();
  const { tourInProgress } = useHelpContext();
  let children;

  switch (tourInProgress) {
    case 'Supply Tour':
      children = <HelpModalSupplyContent />;
      break;
    case 'Withdrawal Tour':
      children = <HelpModalWithdrawContent />;
      break;
    default:
      children = <HelpModalSupplyContent />;
  }

  const handleClose = () => {
    close();
    openConfirmationHelp();
  };

  return (
    <BasicModal open={type === ModalType.MobileHelp} setOpen={handleClose}>
      {children}
    </BasicModal>
  );
};
