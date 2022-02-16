import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { GovVoteModalContent } from './GovVoteModalContent';

export const GovDelegationModal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.GovVote} setOpen={close}>
      <GovVoteModalContent handleClose={close} />
    </BasicModal>
  );
};
