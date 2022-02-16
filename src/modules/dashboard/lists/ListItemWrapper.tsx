import { Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { TokenIcon } from '../../../components/primitives/TokenIcon';
import { AMPLWarning } from './AMPLWarning';

interface ListItemWrapperProps {
  symbol: string;
  iconSymbol: string;
  children: ReactNode;
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  ...rest
}: ListItemWrapperProps) => {
  return (
    <ListItem warningComponent={symbol === 'AMPL' && <AMPLWarning />} {...rest}>
      <ListColumn maxWidth={160} isRow>
        <TokenIcon symbol={iconSymbol} fontSize="large" />
        <Typography variant="subheader1" sx={{ ml: 3 }} noWrap>
          {symbol}
        </Typography>
      </ListColumn>

      {children}
    </ListItem>
  );
};
