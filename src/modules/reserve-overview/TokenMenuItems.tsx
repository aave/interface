import { Box, ListItemIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

/** Group heading inside the reserve token dropdowns; the 0.38rem inset aligns it with the rows. */
export const MenuSectionLabel = ({ children }: { children: ReactNode }) => (
  <Box sx={{ px: '0.38rem', pt: '0.5rem', pb: '0.25rem' }}>
    <Typography variant="subheader2" color="fg-2">
      {children}
    </Typography>
  </Box>
);

interface TokenMenuItemContentProps {
  symbol: string;
  label: ReactNode;
  aToken?: boolean;
  waToken?: boolean;
}

/** Icon + symbol row shared by the "view contracts" and "add to wallet" token dropdowns. */
export const TokenMenuItemContent = ({
  symbol,
  label,
  aToken,
  waToken,
}: TokenMenuItemContentProps) => (
  <>
    <ListItemIcon>
      <TokenIcon symbol={symbol} aToken={aToken} waToken={waToken} sx={{ fontSize: '20px' }} />
    </ListItemIcon>
    <Typography variant="subheader1" noWrap data-cy="assetName">
      {label}
    </Typography>
  </>
);
