import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import { WalletModal } from './WalletModal';

export const ConnectWalletButton = () => {
  const { setWalletModalOpen } = useWalletModalContext();

  return (
    <>
      <Button variant="gradient" onClick={() => setWalletModalOpen(true)}>
        <Trans>Connect wallet</Trans>
      </Button>
      <WalletModal />
    </>
  );
};
