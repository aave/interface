import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { SwapModalContent } from './request/SwapModalContent';

export const SwapModal = () => {
  const {
    type,
    close,
    args: { underlyingAsset, chainId },
  } = useModalContext();
  const { currentAccount } = useWeb3Context();

  return (
    <BasicModal open={type === ModalType.Swap} setOpen={close}>
      {currentAccount ? (
        <>
          <SwapModalContent underlyingAsset={underlyingAsset} chainId={chainId} />
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to swap tokens.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      )}
    </BasicModal>
  );
};
