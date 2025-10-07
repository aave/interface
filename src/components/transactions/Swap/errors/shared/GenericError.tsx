import { Trans } from '@lingui/macro';
import { ContentCopy } from '@mui/icons-material';
import { IconButton, SxProps, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';

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
    <Warning severity="error" sx={{ mt: 4, ...sx }} icon={false}>
      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
        <Trans>{message}</Trans>
        {copyText ? (
          <Tooltip title={copyTooltip} arrow>
            <IconButton
              size="small"
              sx={{ ml: 1 }}
              onClick={handleCopy}
              aria-label="Copy error text"
            >
              <ContentCopy fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Typography>
    </Warning>
  );
};
