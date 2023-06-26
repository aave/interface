import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { BorrowModalContent } from './BorrowModalContent';

export const BorrowModal = () => {
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
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        action="borrow"
        title={<Trans>Borrow</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) => (
          <BorrowModalContent
            {...params}
            unwrap={borrowUnWrapped}
            setUnwrap={handleBorrowUnwrapped}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
