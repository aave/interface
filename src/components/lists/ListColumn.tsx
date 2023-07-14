import { Box } from '@mui/material';
import { ReactNode } from 'react';

export interface ListColumnProps {
  children?: ReactNode;
  maxWidth?: number;
  minWidth?: number;
  isRow?: boolean;
  align?: 'left' | 'center' | 'right';
  overFlow?: 'hidden' | 'visible';
  flex?: string | number;
  p?: string | number;
}

export const ListColumn = ({
  isRow,
  children,
  minWidth,
  maxWidth,
  align = 'center',
  overFlow = 'visible',
  flex = 1,
  p = 1,
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
        flex,
        minWidth: minWidth || '70px',
        maxWidth,
        overflow: overFlow,
        padding: p,
      }}
    >
      {children}
    </Box>
  );
};
