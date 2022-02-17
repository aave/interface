import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { IsolatedTooltip } from './IsolatedTooltip';

export const IsolatedBadge = () => {
  const iconSize = 14;

  return (
    <ContentWithTooltip tooltipContent={<IsolatedTooltip />} withoutHover>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          p: '2px',
          mt: '2px',
          cursor: 'pointer',
          transition: 'all 0.2s easy',
          '&:hover': { opacity: 0.6 },
        }}
      >
        <Typography variant="secondary12" color="text.secondary">
          <Trans>Isolated</Trans>
        </Typography>
        <SvgIcon sx={{ ml: '3px', color: 'divider', fontSize: `${iconSize}px` }}>
          <InformationCircleIcon />
        </SvgIcon>
      </Box>
    </ContentWithTooltip>
  );
};
