import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { DarkTooltip } from './infoTooltips/DarkTooltip';

interface CircleIconProps {
  downToSM: boolean;
  tooltipText: string;
  children: ReactNode;
}

export const CircleIcon = ({ downToSM, tooltipText, children }: CircleIconProps) => {
  return (
    <DarkTooltip
      title={
        <Typography>
          <Trans>{tooltipText}</Trans>
        </Typography>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            bgcolor: (theme) =>
              downToSM && theme.palette.mode === 'light'
                ? 'background.default'
                : 'background.surface',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            ml: '8px',
            border: '0.5px solid',
            borderColor: 'action.active',
            '&:hover': { borderColor: 'info.main' },
          }}
        >
          {children}
        </Box>
      </Box>
    </DarkTooltip>
  );
};
