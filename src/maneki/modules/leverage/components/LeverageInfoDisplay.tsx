import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
// import { Contract } from 'ethers';
import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
// import MANEKI_LEVERAGER_V2_ABI from 'src/maneki/abi/leveragerV2ABI';

export default function LeverageInfoDisplay() {
  return (
    <Box sx={{ padding: '10px', borderRadius: '15px' }}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
          <Trans>Your Borrowed Assets:</Trans>
        </Typography>
        <ValueBox>
          <Typography>
            <Trans>Unstable Coin:</Trans>
          </Typography>
          <FormattedNumber value={'20.500000005'} symbol="ETH" />
        </ValueBox>
        <ValueBox>
          <Typography>
            <Trans>Stable Coin:</Trans>
          </Typography>
          <FormattedNumber value={'20.500000005'} symbol="USDC" />
        </ValueBox>
      </Box>
      <ValueBox>
        <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
          APR:
        </Typography>
        <Typography>10%</Typography>
      </ValueBox>
    </Box>
  );
}

function ValueBox({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {children}
    </Box>
  );
}
