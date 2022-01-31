import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListColumnProps {
  children?: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  isRow?: boolean;
  align?: 'left' | 'center' | 'right';
}

export const ListColumn = ({
  isRow,
  children,
  minWidth,
  maxWidth,
  align = 'center',
}: ListColumnProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        alignItems: isRow
          ? 'center'
          : align === 'left'
          ? 'flex-start'
          : align === 'right'
          ? 'flex-end'
          : align,
        justifyContent: isRow ? 'flex-start' : 'flex-end',
        flex: 1,
        minWidth: minWidth || '70px',
        maxWidth,
        overflow: 'hidden',
        p: 1,
      }}
    >
      {children}
    </Box>
  );
};
