import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { DebtSwapModalContent } from './request/DebtSwapModalContent';

export const DebtSwapModal = () => {
  const {
    type,
    close,
    args: { underlyingAsset },
  } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const { currentAccount } = useWeb3Context();

  return (
    <BasicModal open={type === ModalType.DebtSwap} setOpen={close}>
      {currentAccount ? (
        <>
          <DebtSwapModalContent underlyingAsset={underlyingAsset} />
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to swap debt.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      )}
    </BasicModal>
  );
};
