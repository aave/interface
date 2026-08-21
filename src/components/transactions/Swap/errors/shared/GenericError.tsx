import { Trans } from '@lingui/macro';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { Alert, IconButton, SxProps, Tooltip } from '@mui/material';
import React, { useState } from 'react';

interface GenericErrorProps {
  sx?: SxProps;
  message: string;
  copyText?: string;
}

export const GenericError = ({ sx, message, copyText }: GenericErrorProps) => {
  const [copyTooltip, setCopyTooltip] = useState<'Copy' | 'Copied!'>('Copy');

  const handleCopy = async () => {
    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText);
        setCopyTooltip('Copied!');
        setTimeout(() => setCopyTooltip('Copy'), 1200);
      } catch (e) {
        setCopyTooltip('Copy');
        setTimeout(() => setCopyTooltip('Copy'), 1200);
      }
    }
  };

  return (
    <Alert severity="error" data-size="small" sx={{ mb: 6, width: '100%', mt: 4, ...sx }}>
      <Trans>{message}</Trans>
      {copyText ? (
        <Tooltip title={copyTooltip} arrow>
          <IconButton size="small" sx={{ ml: 1 }} onClick={handleCopy} aria-label="Copy error text">
            <ContentCopy fontSize="inherit" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Alert>
  );
};
