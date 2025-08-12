import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SwapModalContent } from './SwapModalContent';

export const SwapModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const account = useRootStore((store) => store.account);

  return (
    <BasicModal open={type === ModalType.GovVote} setOpen={close}>
      {!account ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to swap tokens.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      ) : (
        <ModalWrapper title={<Trans>Swap</Trans>} underlyingAsset={args.underlyingAsset}>
          {(params) => (
            <UserAuthenticated>
              {(user) => <SwapModalContent {...params} user={user} />}
            </UserAuthenticated>
          )}
        </ModalWrapper>
      )}
    </BasicModal>
  );
};
