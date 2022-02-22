import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { StakeCooldownModalContent } from './StakeCooldownModalContent';

export const StakeCooldownModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.StakeCooldown} setOpen={close}>
      {args?.stakeAssetName && <StakeCooldownModalContent stakeAssetName={args.stakeAssetName} />}
    </BasicModal>
  );
};
