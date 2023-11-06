import { Stack, Tooltip } from '@mui/material';
import { ReactNode } from 'react';
import { PopperComponent } from 'src/components/ContentWithTooltip';
import { PausedTooltipText } from 'src/components/infoTooltips/PausedTooltip';

export const ListItemPausedTooltipWrapper = ({
  isPaused,
  children,
}: {
  isPaused: boolean;
  children: ReactNode;
}) => {
  if (!isPaused) {
    return <>{children}</>;
  }

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
      <span style={{ width: '100%' }}>{children}</span>
    </Tooltip>
  );
};
