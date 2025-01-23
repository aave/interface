import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { StakeCooldownModalContent } from './StakeCooldownModalContent';

export const StakeCooldownModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.UmbrellaStakeCooldown} setOpen={close}>
      {args?.uStakeToken && args.icon && (
        <StakeCooldownModalContent stakeToken={args.uStakeToken} icon={args.icon} />
      )}
    </BasicModal>
  );
};
