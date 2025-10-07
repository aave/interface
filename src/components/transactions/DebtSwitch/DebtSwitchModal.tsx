import { Trans } from '@lingui/macro';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { DebtSwitchModalContent } from './DebtSwitchModalContent';

export const DebtSwitchModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  return null;
  return (
    <BasicModal open={type === ModalType.DebtSwap} setOpen={close}>
      <ModalWrapper
        title={<Trans>Swap borrow position</Trans>}
        underlyingAsset={args.underlyingAsset}
        hideTitleSymbol
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => <DebtSwitchModalContent {...params} user={user} />}
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
