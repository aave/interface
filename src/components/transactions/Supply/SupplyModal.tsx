import { Trans } from '@lingui/macro';
import React from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SupplyModalContentWrapper } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      <ModalWrapper
        action="supply"
        title={<Trans>Supply</Trans>}
        underlyingAsset={args.underlyingAsset}
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => <SupplyModalContentWrapper {...params} user={user} />}
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
