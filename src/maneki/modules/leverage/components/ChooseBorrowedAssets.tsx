import { Box, Typography } from '@mui/material';
import Image from 'next/image';

export default function ChooseBorrowedAssets() {
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
          Untable Coin
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'solid 1px black',
            borderRadius: '15px',
            p: '5px',
          }}
        >
          <Image
            alt={`token image for Ethereum`}
            src={'/icons/tokens/eth.svg'}
            width={32}
            height={32}
          />
          <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
            ETH
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
          Stable Coin
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'solid 1px black',
            borderRadius: '15px',
            p: '5px',
          }}
        >
          <Image
            alt={`token image for Ethereum`}
            src={'/icons/tokens/usdc.svg'}
            width={32}
            height={32}
          />
          <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
            USDC
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
