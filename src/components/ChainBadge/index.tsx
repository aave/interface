import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { figVars } from 'src/utils/figmaColors';

export const ChainBadge = ({
  chainId,
  size,
  children,
}: {
  chainId: ChainId;
  size: number;
  children: ReactNode;
}) => (
  <Box
    component="span"
    sx={{
      position: 'relative',
      display: 'inline-flex',
      flexShrink: 0,
      width: size,
      height: size,
    }}
  >
    {children}
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        position: 'absolute',
        right: -size / 24,
        bottom: -size / 24,
        width: size / 2,
        height: size / 2,
        borderRadius: '50%',
        boxShadow: `0 0 0 ${size / 16}px ${figVars['migration-chain-badge-ring']}`,
      }}
    >
      <ChainIcon chainId={chainId} size="100%" />
    </Box>
  </Box>
);
