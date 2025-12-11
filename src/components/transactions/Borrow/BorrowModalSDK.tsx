import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapperSDK } from '../FlowCommons/ModalWrapperSDK';
import { BorrowModalContentSDK } from './BorrowModalContentSDK';

export const BorrowModalSDK = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleBorrowUnwrapped = (borrowUnWrapped: boolean) => {
    trackEvent(GENERAL.OPEN_MODAL, {
      modal: 'Unwrap Asset',
      asset: args.underlyingAsset,
      assetWrapped: borrowUnWrapped,
    });
    setBorrowUnWrapped(borrowUnWrapped);
  };

  return (
    <BasicModal open={type === ModalType.BorrowSDK} setOpen={close}>
      <ModalWrapperSDK
        action="borrow"
        title={<Trans>Borrow</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => (
              <BorrowModalContentSDK
                {...params}
                user={user}
                unwrap={borrowUnWrapped}
                setUnwrap={handleBorrowUnwrapped}
              />
            )}
          </UserAuthenticated>
        )}
      </ModalWrapperSDK>
    </BasicModal>
  );
};
