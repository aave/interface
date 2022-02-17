import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { RateSwitchModalContent } from './RateSwitchModalContent';

export const RateSwitchModal = () => {
  const { type, close, args } = useModalContext();

  return (
    <BasicModal open={type === ModalType.RateSwitch} setOpen={close}>
      {args?.underlyingAsset && (
        <RateSwitchModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
