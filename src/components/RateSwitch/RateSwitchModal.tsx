import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { RateSwitchModalContent } from './RateSwitchModalContent';

export const RateSwitchModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.RateSwitch} setOpen={close}>
      {args?.underlyingAsset && (
        <RateSwitchModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
