import React from 'react';
import { BasicModal } from '../primitives/BasicModal';
import { SupplyModalContent } from './SupplyModalContent';

export type SupplyProps = {
  underlyingAsset: string;
  open: boolean;
  handleClose: () => void;
};

export const SupplyModal = ({ underlyingAsset, open, handleClose }: SupplyProps) => {
  return (
    <BasicModal open={open} setOpen={handleClose}>
      <SupplyModalContent underlyingAsset={underlyingAsset} handleClose={handleClose} />
    </BasicModal>
  );
};
