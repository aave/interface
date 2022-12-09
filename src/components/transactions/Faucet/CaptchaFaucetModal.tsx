import React from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { CaptchaFaucetModalContent } from './CaptchaFaucetModalContent';

export const CaptchaFaucetModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.CaptchaFaucet} setOpen={close}>
      <CaptchaFaucetModalContent underlyingAsset={args.underlyingAsset} />
    </BasicModal>
  );
};
