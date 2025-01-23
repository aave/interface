import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { StakeCooldownModalContent } from './StakeCooldownModalContent';
import { BasicModal } from 'src/components/primitives/BasicModal';

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
