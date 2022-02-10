import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { ClaimRewardsModalContent } from './ClaimRewardsModalContent';

export const ClaimRewardsModal = () => {
  const { type, close } = useModalContext();
  return (
    <ActionModal open={type === ModalType.ClaimRewards} setOpen={close}>
      <ClaimRewardsModalContent handleClose={close} />
    </ActionModal>
  );
};
