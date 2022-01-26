import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListColumnProps {
  children: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  isRow?: boolean;
}

export const ListColumn = ({ isRow, children, minWidth, maxWidth }: ListColumnProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isRow ? 'flex-start' : 'flex-end',
        flex: 1,
        minWidth: minWidth || '110px',
        maxWidth,
        overflow: 'hidden',
        p: 1,
      }}
    >
      {children}
    </Box>
  );
};
