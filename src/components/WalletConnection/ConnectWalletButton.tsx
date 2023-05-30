import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { useWalletModalContext } from 'src/hooks/useWalletModal';

import { WalletModal } from './WalletModal';

export const ConnectWalletButton = () => {
  const { setWalletModalOpen } = useWalletModalContext();

  return (
    <>
      <Button onClick={() => setWalletModalOpen(true)} variant={'wallet'}>
        <Trans>Connect wallet</Trans>
      </Button>
      <WalletModal />
    </>
  );
};
