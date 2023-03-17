import { ExclamationIcon } from '@heroicons/react/outline';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { BUSDOffBoardingWarning } from '../Warnings/BUSDOffBoardingWarning';

export const BUSDOffBoardingTooltip = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <BUSDOffBoardingWarning />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
