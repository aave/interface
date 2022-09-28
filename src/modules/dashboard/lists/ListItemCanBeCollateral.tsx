import { CheckIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { Box, SvgIcon } from '@mui/material';

import { NoData } from '../../../components/primitives/NoData';
import { ListItemIsolationBadge } from './ListItemIsolationBadge';

interface ListItemCanBeCollateralProps {
  isIsolated: boolean;
  usageAsCollateralEnabled: boolean;
}

export const ListItemCanBeCollateral = ({
  isIsolated,
  usageAsCollateralEnabled,
}: ListItemCanBeCollateralProps) => {
  const CollateralStates = () => {
    if (usageAsCollateralEnabled && !isIsolated) {
      return (
        <SvgIcon sx={{ color: 'success.main', fontSize: { xs: '20px', xsm: '24px' } }}>
          <CheckIcon />
        </SvgIcon>
      );
    } else if (usageAsCollateralEnabled && isIsolated) {
      return (
        <SvgIcon sx={{ color: 'warning.main', fontSize: { xs: '20px', xsm: '24px' } }}>
          <ExclamationCircleIcon />
        </SvgIcon>
      );
    } else {
      return <NoData variant="main14" color="text.secondary" />;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!isIsolated ? (
        <CollateralStates />
      ) : (
        <ListItemIsolationBadge>
          <CollateralStates />
        </ListItemIsolationBadge>
      )}
    </Box>
  );
};
