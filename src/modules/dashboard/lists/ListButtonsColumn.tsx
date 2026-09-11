import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';

export const ListButtonsColumn = ({ children }: { children?: ReactNode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        maxWidth: DASHBOARD_LIST_COLUMN_WIDTHS.BUTTONS,
        minWidth: DASHBOARD_LIST_COLUMN_WIDTHS.BUTTONS,
        flex: 1,
        // Inter-button gap for row-action buttons. Label + padding now come from the theme's
        // size="small" slot (buttonM + 0.62rem), so no per-button override is needed here.
        '.MuiButton-root': {
          ml: '0.62rem',
        },
      }}
    >
      {children}
    </Box>
  );
};
