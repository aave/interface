import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ClaimRewardsModalContent } from './ClaimRewardsModalContent';

export const ClaimRewardsModal = () => {
  const { type, close } = useModalContext();
  return (
    <BasicModal open={type === ModalType.ClaimRewards} setOpen={close}>
      <ClaimRewardsModalContent />
    </BasicModal>
  );
};
