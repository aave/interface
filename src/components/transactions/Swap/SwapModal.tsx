import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SwapModalContent } from './SwapModalContent';

export const SwapModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  return (
    <BasicModal open={type === ModalType.Swap} setOpen={close}>
      <ModalWrapper title={<Trans>Switch</Trans>} underlyingAsset={args.underlyingAsset}>
        {(params) => <SwapModalContent {...params} />}
      </ModalWrapper>
    </BasicModal>
  );
};
