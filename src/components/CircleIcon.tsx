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
            bgcolor: 'bg-6',
            width: downToSM ? '18px' : '24px',
            height: downToSM ? '18px' : '24px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            ml: '8px',
            border: '0.5px solid',
            borderColor: 'border-1',
          }}
        >
          {children}
        </Box>
      </Box>
    </DarkTooltip>
  );
};
