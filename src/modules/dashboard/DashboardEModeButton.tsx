import { CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, IconButton, SvgIcon } from '@mui/material';
import React from 'react';

import { EModeInfoContent } from '../../components/infoModalContents/EModeInfoContent';
import { TextWithModal } from '../../components/TextWithModal';

interface DashboardEModeButtonProps {
  onClick: () => void;
}

export const DashboardEModeButton = ({ onClick }: DashboardEModeButtonProps) => {
  const iconButtonSize = 20;

  return (
    <Box
      sx={{ display: 'inline-flex', alignItems: 'center' }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <TextWithModal
        text={<Trans>E-Mode</Trans>}
        variant="description"
        color="text.secondary"
        iconSize={14}
      >
        <EModeInfoContent />
      </TextWithModal>

      <IconButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        sx={{
          width: `${iconButtonSize}px`,
          height: `${iconButtonSize}px`,
          ml: '5px',
          minWidth: 'unset',
        }}
      >
        <SvgIcon sx={{ fontSize: `${iconButtonSize}px` }}>
          <CogIcon />
        </SvgIcon>
      </IconButton>
    </Box>
  );
};
