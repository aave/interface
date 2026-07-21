import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

type ReserveOverviewBoxProps = {
  children: ReactNode;
  title?: ReactNode;
  fullWidth?: boolean;
};

export function ReserveOverviewBox({
  title,
  children,
  fullWidth = false,
}: ReserveOverviewBoxProps) {
  return (
    <Box
      sx={{
        borderRadius: '6px',
        border: `1px solid ${figVars['border-2']}`,
        flex: fullWidth ? '0 100%' : '0 32%',
        marginBottom: '2%',
        maxWidth: fullWidth ? '100%' : '32%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-around',
          padding: '8px',
        }}
      >
        {title && (
          <Typography variant="secondary14" color="fg-2" component="span">
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  );
}
