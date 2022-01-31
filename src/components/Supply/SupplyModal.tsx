import React from 'react';
import { ActionModal } from '../primitives/ActionModal';
import { SupplyModalContent } from './SupplyModalContent';

export type SupplyProps = {
  underlyingAsset: string;
  open: boolean;
  handleClose: () => void;
};

export const SupplyModal = ({ underlyingAsset, open, handleClose }: SupplyProps) => {
  return (
    <ActionModal open={open} setOpen={handleClose}>
      <SupplyModalContent underlyingAsset={underlyingAsset} handleClose={handleClose} />
    </ActionModal>
  );
};
