import { Box, Divider, Typography } from '@mui/material';
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
      <Divider />

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '71px', px: 4 }}>
        <ListColumn maxWidth={160} isRow>
          <TokenIcon symbol={tokenSymbol} fontSize="large" />
          <Typography variant="subheader1" sx={{ ml: 2 }} noWrap>
            {tokenSymbol}
          </Typography>
        </ListColumn>

        {children}
      </Box>
    </Box>
  );
};
