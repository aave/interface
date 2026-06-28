import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { StakingMigrateModalContent } from './StakingMigrateModalContent';

export const StakingMigrateModal = () => {
  const { type, close } = useModalContext();

  return (
    <BasicModal open={type === ModalType.StakingMigrate} setOpen={close}>
      <StakingMigrateModalContent />
    </BasicModal>
  );
};
