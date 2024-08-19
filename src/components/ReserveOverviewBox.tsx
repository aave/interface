import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

type ReserveOverviewBoxProps = {
  children: ReactNode;
  title?: ReactNode;
  fullWidth?: boolean;
};

export function ReserveOverviewBox({ title, children }: ReserveOverviewBoxProps) {
  return (
    <Box
      sx={{
        height: '100%',
        minWidth: 140,
      }}
    >
      {title && (
        <Typography variant="detail2" color="text.mainTitle" component="span">
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
}
