import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';

type ReserveOverviewBoxProps = {
  children: ReactNode;
};

export function ReserveOverviewBox({ children }: ReserveOverviewBoxProps) {
  return (
    <Box border="1px solid" borderColor="divider" borderRadius="4px" paddingY="8px" width="33%">
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>{children}</Box>
    </Box>
  );
}
