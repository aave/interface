import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

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
      sx={(theme) => ({
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        flex: fullWidth ? '0 100%' : '0 32%',
        marginBottom: '2%',
        maxWidth: fullWidth ? '100%' : '32%',
      })}
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
          <Typography variant="secondary14" color="text.secondary" component="span">
            {title}
          </Typography>
        )}
        {children}
      </Box>
    </Box>
  );
}
