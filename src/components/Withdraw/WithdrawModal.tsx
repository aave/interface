import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { ActionModal } from '../primitives/ActionModal';
import { WithdrawModalContent } from './WithdrawModalContent';

export const WithdrawModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <ActionModal open={type === ModalType.Withdraw} setOpen={close}>
      {args?.underlyingAsset && (
        <WithdrawModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </ActionModal>
  );
};
