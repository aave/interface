import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListColumnProps {
  children?: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  isRow?: boolean;
  align?: 'left' | 'center' | 'right';
  overFlow?: 'hidden' | 'visible';
}

export const ListColumn = ({
  isRow,
  children,
  minWidth,
  maxWidth,
  align = 'center',
  overFlow = 'hidden',
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
        overflow: overFlow,
        p: 1,
      }}
    >
      {children}
    </Box>
  );
};
