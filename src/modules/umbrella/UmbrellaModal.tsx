import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UmbrellaModalContent } from './UmbrellaModalContent';

export const UmbrellaModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.Umbrella} setOpen={close}>
      {args?.icon && args?.umbrellaAssetName && (
        <UmbrellaModalContent icon={args.icon} umbrellaAssetName={args.umbrellaAssetName} />
      )}
    </BasicModal>
  );
};
