import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { ListColumn } from './ListColumn';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  children: ReactNode;
}

export const ListItemWrapper = ({ symbol, iconSymbol, children }: ListItemWrapperProps) => {
  return (
    <Box>
      <Divider />

      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '71px', px: 4 }}>
        <ListColumn maxWidth={160} isRow>
          <TokenIcon symbol={iconSymbol} fontSize="large" />
          <Tooltip title={symbol} arrow placement="top">
            <Typography variant="subheader1" sx={{ ml: 3 }} noWrap>
              {symbol}
            </Typography>
          </Tooltip>
        </ListColumn>

        {children}
      </Box>
    </Box>
  );
};
