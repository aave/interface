import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { RateSwitchModalContent } from './RateSwitchModalContent';

export const RateSwitchModal = () => {
  const { type, close, args } = useModalContext();

  return (
    <BasicModal open={type === ModalType.RateSwitch} setOpen={close}>
      {args?.underlyingAsset && args.currentRateMode && (
        <RateSwitchModalContent
          underlyingAsset={args.underlyingAsset}
          currentRateMode={args.currentRateMode}
        />
      )}
    </BasicModal>
  );
};
