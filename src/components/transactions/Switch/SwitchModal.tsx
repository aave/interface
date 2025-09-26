import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { BaseSwitchModal } from './BaseSwitchModal';
import { SwitchLimitOrdersModalContent } from './SwitchLimitOrdersModalContent';
import { SwitchType, SwitchTypeSelector } from './SwitchTypeSelector';

export const SwitchModal = () => {
  const { type, close } = useModalContext();
  const [switchType, setSwitchType] = useState(SwitchType.MARKET);
  const { currentAccount } = useWeb3Context();
  return (
    <BasicModal open={type === ModalType.Switch} setOpen={close}>
      <TxModalTitle title={`Swap Assets`} />
      {currentAccount ? (
        <>
          <SwitchTypeSelector switchType={switchType} setSwitchType={setSwitchType} />
          {switchType === SwitchType.MARKET && <BaseSwitchModal modalType={ModalType.Switch} />}
          {switchType === SwitchType.LIMIT && <SwitchLimitOrdersModalContent />}
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
