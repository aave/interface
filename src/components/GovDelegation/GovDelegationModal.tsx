import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { GovDelegationModalContent } from './GovDelegationModalContent';

export const GovDelegationModal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.GovDelegation} setOpen={close}>
      <GovDelegationModalContent handleClose={close} />
    </BasicModal>
  );
};
