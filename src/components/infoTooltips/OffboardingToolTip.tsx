import { ExclamationIcon } from '@heroicons/react/outline';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { OffboardingWarning } from '../Warnings/OffboardingWarning';

export const OffboardingTooltip = ({ discussionLink }: { discussionLink: string }) => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <OffboardingWarning discussionLink={discussionLink} />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
