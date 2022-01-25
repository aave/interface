import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { ListColumn } from './ListColumn';

interface ListItemWrapperProps {
  tokenSymbol: string;
  children: ReactNode;
}

export const ListItemWrapper = ({ tokenSymbol, children }: ListItemWrapperProps) => {
  return (
    <Box>
      <ListColumn>
        <TokenIcon symbol={tokenSymbol} />
      </ListColumn>

      {children}
    </Box>
  );
};
