import { ExclamationIcon } from '@heroicons/react/outline';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { BorrowDisabledWarning } from '../Warnings/BorrowDisabledWarning';

export const BorrowDisabledToolTip = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <BorrowDisabledWarning />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
