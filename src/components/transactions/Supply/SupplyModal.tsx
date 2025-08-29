import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SupplyModalContentWrapper } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const account = useRootStore((store) => store.account);

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      {!account ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to supply assets.</Trans>
          </Typography>
          <ConnectWalletButton onClick={() => close()} />
        </Box>
      ) : (
        <ModalWrapper
          action="supply"
          title={<Trans>Supply</Trans>}
          underlyingAsset={args.underlyingAsset}
        >
          {(params) => (
            <UserAuthenticated>
              {(user) => <SupplyModalContentWrapper {...params} user={user} />}
            </UserAuthenticated>
          )}
        </ModalWrapper>
      )}
    </BasicModal>
  );
};
