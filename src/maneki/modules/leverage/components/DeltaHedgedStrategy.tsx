import { Box, Typography } from '@mui/material';
import Image from 'next/image';

import { useLeverageContext } from '../../../hooks/leverage-data-provider/LeverageDataProvider';

export default function DeltaHedgedStrategy() {
  const { currentBorrowedStableAsset, currentBorrowedUnstableAsset } = useLeverageContext();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '20px',
        p: '6px 6px',
        borderRadius: '15px',
        border: 'solid 2px grey',
        m: '20px auto',
      }}
    >
      <TokenBox
        src={`/icons/tokens/${currentBorrowedUnstableAsset?.symbol.toLowerCase()}.svg`}
        token={currentBorrowedUnstableAsset?.symbol || ' '}
      />
      <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>50:50</Typography>
      <TokenBox
        src={`/icons/tokens/${currentBorrowedStableAsset?.symbol.toLowerCase()}.svg`}
        token={currentBorrowedStableAsset?.symbol || ' '}
      />
    </Box>
  );
}

interface TokenBoxProps {
  src: string;
  token: string;
}
function TokenBox({ src, token }: TokenBoxProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image alt={`image for token ${token}`} src={src} width={32} height={32} />
      <Typography sx={{ fontSize: '20px', fontWeight: '600' }}>{token}</Typography>
    </Box>
  );
}
