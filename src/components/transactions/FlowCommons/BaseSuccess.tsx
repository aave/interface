import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Button, Link, SvgIcon, Typography, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SCAN_TRANSACTION_TON } from 'src/hooks/app-data-provider/useAppDataProviderTon';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export type BaseSuccessTxViewProps = {
  txHash?: string;
  children: ReactNode;
  hideTx?: boolean;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const BaseSuccessView = ({ txHash, children, hideTx }: BaseSuccessTxViewProps) => {
  const { close, mainTxState } = useModalContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const { isConnectNetWorkTon } = useAppDataContext();

  const hrefTon = `${SCAN_TRANSACTION_TON}/transaction/${txHash ? txHash : mainTxState.txHash}`;
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: '6px',
          mb: '20px',
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
          <SvgIcon sx={{ color: 'success.main', fontSize: '60px' }}>
            <CheckCircleIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 5, mb: 2 }} variant="body1">
          <Trans>All done!</Trans>
        </Typography>

        {children}
      </Box>

      {!hideTx && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            variant="helperText"
            href={
              isConnectNetWorkTon
                ? hrefTon
                : currentNetworkConfig.explorerLinkBuilder({
                    tx: txHash ? txHash : mainTxState.txHash,
                  })
            }
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'right',
              p: '0px 4px 0px 8px',
              width: 'max-content',
              marginLeft: 'auto',
              color: theme.palette.text.subTitle,
              borderRadius: '4px',
              border: `1px solid ${theme.palette.text.subTitle}`,
            }}
            underline="hover"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Trans>Review tx details</Trans>
            <ExtLinkIcon />
          </Link>
          <Button
            onClick={close}
            variant="contained"
            size="large"
            sx={{ minHeight: '44px', mt: 12 }}
            data-cy="closeButton"
          >
            <Trans>Ok, Close</Trans>
          </Button>
        </Box>
      )}
    </>
  );
};
