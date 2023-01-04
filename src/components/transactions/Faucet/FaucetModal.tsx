import { Trans } from '@lingui/macro';
import React from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { CaptchaFaucetModalContent } from './CaptchaFaucetModalContent';
import { FaucetModalContent } from './FaucetModalContent';

export const FaucetModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const { isFaucetPermissioned } = useRootStore();

  return (
    <BasicModal open={type === ModalType.Faucet} setOpen={close}>
      {isFaucetPermissioned ? (
        <CaptchaFaucetModalContent underlyingAsset={args.underlyingAsset} />
      ) : (
        <ModalWrapper title={<Trans>Faucet</Trans>} underlyingAsset={args.underlyingAsset}>
          {(params) => <FaucetModalContent {...params} />}
        </ModalWrapper>
      )}
    </BasicModal>
  );
};
