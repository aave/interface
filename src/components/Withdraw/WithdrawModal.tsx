import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../primitives/BasicModal';
import { WithdrawModalContent } from './WithdrawModalContent';

export const WithdrawModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={close}>
      {args?.underlyingAsset && (
        <WithdrawModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
