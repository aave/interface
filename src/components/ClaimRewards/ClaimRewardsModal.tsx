import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { ClaimRewardsModalContent } from './ClaimRewardsModalContent';

export const ClaimRewardsModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.Supply} setOpen={close}>
      {args?.underlyingAsset && (
        <ClaimRewardsModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
