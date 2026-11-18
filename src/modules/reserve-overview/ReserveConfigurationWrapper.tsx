import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

type ReserveConfigurationProps = {
  reserve: ReserveWithId;
};

const GhoReserveConfiguration = dynamic(() =>
  import('./Gho/GhoReserveConfiguration').then((module) => module.GhoReserveConfiguration)
);

const ReserveConfiguration = dynamic(() =>
  import('./ReserveConfiguration').then((module) => module.ReserveConfiguration)
);

export const ReserveConfigurationWrapper: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const currentMarket = useRootStore((state) => state.currentMarket);
  const isGho = displayGhoForMintableMarket({
    symbol: reserve.underlyingToken.symbol,
    currentMarket,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {isGho ? (
        <GhoReserveConfiguration reserve={reserve} />
      ) : (
        <ReserveConfiguration reserve={reserve} />
      )}
    </Box>
  );
};
