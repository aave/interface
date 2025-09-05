import { ExternalLinkIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

export type BaseSuccessTxViewProps = {
  txHash?: string;
  children: ReactNode;
  hideTx?: boolean;
  customExplorerLink?: string;
  customExplorerLinkText?: ReactNode;
  onClose?: () => void;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: 2, fontWeight: 800, fontSize: '20px', color: 'text.primary' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const BaseSuccessView = ({
  txHash,
  children,
  hideTx,
  customExplorerLink,
  customExplorerLinkText,
  onClose,
}: BaseSuccessTxViewProps) => {
  const { close: modalClose, mainTxState } = useModalContext();
  const handleClose = onClose || modalClose;
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '48px',
            height: '48px',
            bgcolor: 'success.200',
            borderRadius: '50%',
            mt: 14,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ color: 'success.main', fontSize: '32px' }}>
            <CheckIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <Trans>All done</Trans>
        </Typography>

        {children}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {hideTx ? (
          <br />
        ) : (
          <Button
            variant="outlined"
            size="large"
            sx={{ borderRadius: 1, borderColor: 'divider', borderWidth: 1, mt: 6, mb: 2 }}
            href={
              customExplorerLink
                ? customExplorerLink
                : currentNetworkConfig.explorerLinkBuilder({
                    tx: txHash ? txHash : mainTxState.txHash,
                  })
            }
            target="_blank"
            rel="noreferrer noopener"
          >
            {customExplorerLinkText ? customExplorerLinkText : <Trans>Review tx details</Trans>}
            <ExtLinkIcon />
          </Button>
        )}

        <Button
          onClick={handleClose}
          variant="contained"
          size="large"
          sx={{ minHeight: '50px', mb: '30px' }}
          data-cy="closeButton"
        >
          <Trans>Ok, Close</Trans>
        </Button>
      </Box>
    </>
  );
};
