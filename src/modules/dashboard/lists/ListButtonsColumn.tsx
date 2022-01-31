import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListButtonsColumnProps {
  children?: ReactNode;
}

export const ListButtonsColumn = ({ children }: ListButtonsColumnProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        maxWidth: 170,
        minWidth: 170,
        flex: 1,
        '.MuiButton-root': {
          ml: '6px',
        },
      }}
    >
      {children}
    </Box>
  );
};
