import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { BasicModal } from '../primitives/BasicModal';
import { FaucetModalContent } from './FaucetModalContent';

export const FaucetModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Faucet} setOpen={close}>
      {args?.underlyingAsset && (
        <FaucetModalContent underlyingAsset={args.underlyingAsset} handleClose={close} />
      )}
    </BasicModal>
  );
};
