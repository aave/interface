import { Dispatch, SetStateAction } from 'react';
import { BasicModal } from '../primitives/BasicModal';
import { WalletSelector } from './WalletSelector';

export const WalletModal = ({
  isWalletModalOpen,
  setWalletModalOpen,
}: {
  isWalletModalOpen: boolean;
  setWalletModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <BasicModal open={isWalletModalOpen} setOpen={setWalletModalOpen}>
      <WalletSelector />
    </BasicModal>
  );
};
