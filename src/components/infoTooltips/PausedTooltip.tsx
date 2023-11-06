import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';

export const PausedTooltipText = () => {
  return (
    <Trans>
      This asset has been paused due to a community decision. Supply, withdraw, borrows and repays
      are impacted.
    </Trans>
  );
};

export const PausedTooltip = () => {
  return (
    <ContentWithTooltip tooltipContent={<PausedTooltipText />}>
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
