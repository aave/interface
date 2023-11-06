import { Stack, Tooltip } from '@mui/material';
import { ReactNode } from 'react';
import { PopperComponent } from 'src/components/ContentWithTooltip';
import { PausedTooltipText } from 'src/components/infoTooltips/PausedTooltip';

export const ListItemPausedTooltipWrapper = ({
  isPaused,
  children,
  fullWidth,
}: {
  isPaused: boolean;
  children: ReactNode;
  fullWidth?: boolean;
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
      <span style={{ width: fullWidth ? '100%' : 'unset' }}>{children}</span>
    </Tooltip>
  );
};
