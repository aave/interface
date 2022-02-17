import { Box, Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { Link, ROUTES } from '../primitives/Link';
import { TokenIcon } from '../primitives/TokenIcon';

interface ListMobileItemProps {
  warningComponent?: ReactNode;
  children: ReactNode;
  symbol: string;
  iconSymbol: string;
  name: string;
  underlyingAsset: string;
}

export const ListMobileItem = ({
  children,
  warningComponent,
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
}: ListMobileItemProps) => {
  return (
    <Box>
      <Divider />

      <Box sx={{ px: 4, pt: 4, pb: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Link
            href={ROUTES.reserveOverview(underlyingAsset)}
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <TokenIcon symbol={iconSymbol} sx={{ fontSize: '40px' }} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h4">{name}</Typography>
              <Typography variant="subheader2" color="text.disabled">
                {symbol}
              </Typography>
            </Box>
          </Link>

          {warningComponent}
        </Box>

        {children}
      </Box>
    </Box>
  );
};
