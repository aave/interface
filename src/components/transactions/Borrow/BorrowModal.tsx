import { PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useState } from 'react';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ghoMintingAvailable } from 'src/utils/ghoUtilities';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { BorrowModalContent } from './BorrowModalContent';
import { GHOBorrowModalContent } from './GHOBorrowModalContent';

export const BorrowModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const { currentMarket } = useProtocolDataContext();

  return (
    <BasicModal open={type === ModalType.Borrow} setOpen={close}>
      <ModalWrapper
        title={<Trans>Borrow</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!borrowUnWrapped}
        requiredPermission={PERMISSION.BORROWER}
      >
        {(params) =>
          ghoMintingAvailable({
            symbol: params.symbol,
            currentMarket,
          }) ? (
            <GHOBorrowModalContent {...params} />
          ) : (
            <BorrowModalContent
              {...params}
              unwrap={borrowUnWrapped}
              setUnwrap={setBorrowUnWrapped}
            />
          )
        }
      </ModalWrapper>
    </BasicModal>
  );
};
