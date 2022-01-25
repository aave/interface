import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface ListColumnProps {
  children: ReactNode;
}

export const ListColumn = ({ children }: ListColumnProps) => {
  return <Box>{children}</Box>;
};
