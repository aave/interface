import { Box, Skeleton } from '@mui/material';

import { TxModalDetails } from '../../FlowCommons/TxModalDetails';
import { SwapState } from '../types';

export const DetailsSkeleton: React.FC<{ state: SwapState }> = ({
  state,
}: {
  state: SwapState;
}) => {
  return (
    <TxModalDetails chainId={state.chainId} showGasStation={false}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" height={18} width="40%" />
          <Skeleton variant="rounded" height={18} width="30%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" height={18} width="35%" />
          <Skeleton variant="rounded" height={18} width="25%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" height={18} width="50%" />
          <Skeleton variant="rounded" height={18} width="20%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" height={18} width="40%" />
          <Skeleton variant="rounded" height={18} width="30%" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" height={18} width="20%" />
          <Skeleton variant="rounded" height={18} width="20%" />
        </Box>
      </Box>
    </TxModalDetails>
  );
};
