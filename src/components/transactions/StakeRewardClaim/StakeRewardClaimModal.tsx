import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { BasicModal } from '../../primitives/BasicModal';
import { StakeRewardClaimModalContent } from './StakeRewardClaimModalContent';

export const StakeRewardClaimModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.StakeRewardClaim} setOpen={close}>
      {args?.stakeAssetName && (
        <StakeRewardClaimModalContent stakeAssetName={args.stakeAssetName} handleClose={close} />
      )}
    </BasicModal>
  );
};
