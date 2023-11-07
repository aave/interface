import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Stack, SvgIcon, Tooltip } from '@mui/material';

import { PopperComponent } from '../ContentWithTooltip';

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
    <Tooltip
      arrow
      placement="top"
      PopperComponent={PopperComponent}
      title={
        <Stack sx={{ py: 4, px: 6 }} spacing={1}>
          <PausedTooltipText />
        </Stack>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </Tooltip>
  );
};
