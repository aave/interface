import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { CustomRPCProvider } from 'src/components/custom-rpc-modal/CustomRPCProvider';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { CustomRPCProvider as Provider } from 'src/utils/marketsAndNetworksConfig';

export const CustomRPCModal = () => {
  const { type, close } = useModalContext();

  const handleClose = () => {
    const localStorage = global?.window?.localStorage;
    const customRPCProviders: Provider[] | null = JSON.parse(
      localStorage.getItem('customRPCProviders') || 'null'
    );

    if (!customRPCProviders) {
      localStorage.removeItem('rpcSetUp');
      localStorage.removeItem('usingCustomRPC');
    }

    close();

    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  return (
    <BasicModal open={type === ModalType.CustomRPC} setOpen={close}>
      <Typography variant="h2" sx={{ mb: 6 }}>
        <Trans>Add Custom RPC URLs</Trans>
      </Typography>

      <CustomRPCProvider handleClose={handleClose} />
    </BasicModal>
  );
};
