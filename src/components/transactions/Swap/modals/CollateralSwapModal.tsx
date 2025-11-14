import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { CollateralSwapModalContent } from './request/CollateralSwapModalContent';

export const CollateralSwapModal = () => {
  const { currentAccount } = useWeb3Context();
  const {
    args: { underlyingAsset },
    type,
    close,
  } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <BasicModal open={type === ModalType.CollateralSwap} setOpen={close}>
      {currentAccount ? (
        <>
          <CollateralSwapModalContent underlyingAsset={underlyingAsset} />
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to swap collateral.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      )}
    </BasicModal>
  );
};
