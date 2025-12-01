import { Trans } from '@lingui/macro';
import React from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapperSDK } from '../FlowCommons/ModalWrapperSDK';
import { SupplyModalContentWrapperSDK } from './SupplyModalContentSDK';

export const SupplyModalSDK = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  //!Debbugging log
  console.log('Rendering SupplyModalSDK');
  return (
    <BasicModal open={type === ModalType.SupplySDK} setOpen={close}>
      <ModalWrapperSDK
        action="supply"
        title={<Trans>Supply</Trans>}
        underlyingAsset={args.underlyingAsset}
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => <SupplyModalContentWrapperSDK {...params} user={user} />}
          </UserAuthenticated>
        )}
      </ModalWrapperSDK>
    </BasicModal>
  );
};
