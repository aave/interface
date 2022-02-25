import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useState } from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { BasicModal } from '../primitives/BasicModal';
import { WalletModal } from './WalletModal';
import { WalletSelector } from './WalletSelector';

export const ConnectWalletButton = () => {
  const { connected } = useWeb3Context();
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  const handleWalletModalOpen = () => {
    if (!connected) {
      setWalletModalOpen(true);
    }
  };

  return (
    <>
      <Button variant="gradient" onClick={handleWalletModalOpen}>
        <Trans>Connect wallet</Trans>
      </Button>
      <WalletModal isWalletModalOpen={isWalletModalOpen} setWalletModalOpen={setWalletModalOpen} />
    </>
  );
};
