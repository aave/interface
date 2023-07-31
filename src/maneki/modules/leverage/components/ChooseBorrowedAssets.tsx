import { Box, Typography } from '@mui/material';

import { useLeverageContext } from '../../../hooks/leverage-data-provider/LeverageDataProvider';
import { LEVERAGE_STABLE_COINS, LEVERAGE_UNSTABLE_COINS } from '../config';
import LeverageBorrwAsset from './LeverageBorrowAsset';

export default function ChooseBorrowedAssets() {
  const {
    currentBorrowedUnstableAsset,
    currentBorrowedStableAsset,
    setCurrentBorrowedUnstableAsset,
    setCurrentBorrowedStableAsset,
  } = useLeverageContext();

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
          Untable Coin
        </Typography>

        {/** Assets List */}
        <Box
          sx={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          {LEVERAGE_UNSTABLE_COINS.map((e) => (
            <LeverageBorrwAsset
              handleSelect={() => setCurrentBorrowedUnstableAsset(e)}
              key={e.symbol}
              isSelected={
                currentBorrowedUnstableAsset?.symbol.toUpperCase() == e.symbol.toUpperCase()
              }
              isLocked={false}
              symbol={e.symbol}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: '700px', lineHeight: '1.6' }}>
          Stable Coin
        </Typography>

        {/** Assets List */}
        <Box
          sx={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          {LEVERAGE_STABLE_COINS.map((e) => (
            <LeverageBorrwAsset
              handleSelect={() => setCurrentBorrowedStableAsset(e)}
              key={e.symbol}
              isSelected={
                currentBorrowedStableAsset?.symbol.toUpperCase() == e.symbol.toUpperCase()
              }
              isLocked={false}
              symbol={e.symbol}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
