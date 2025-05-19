import { ClockIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

export type BaseWaitingTxViewProps = {
  txHash?: string;
  customExplorerLink?: string;
  customExplorerLinkText?: string;
  children: ReactNode;
  hideTx?: boolean;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: 2, fontWeight: 800, fontSize: '20px', color: 'text.primary' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const BaseWaitingView = ({
  txHash,
  children,
  hideTx,
  customExplorerLink,
  customExplorerLinkText,
}: BaseWaitingTxViewProps) => {
  const { close, mainTxState } = useModalContext();
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
          <SvgIcon sx={{ fontSize: '32px' }}>
            <ClockIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <Trans>In progress</Trans>
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
          onClick={close}
          variant="contained"
          size="large"
          sx={{ minHeight: '50px' }}
          data-cy="closeButton"
        >
          <Trans>Ok, Close</Trans>
        </Button>
      </Box>
    </>
  );
};
