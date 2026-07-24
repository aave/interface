import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';

interface ListButtonsColumnProps {
  children?: ReactNode;
  isColumnHeader?: boolean;
}

export const ListButtonsColumn = ({ children, isColumnHeader = false }: ListButtonsColumnProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        maxWidth: DASHBOARD_LIST_COLUMN_WIDTHS.BUTTONS,
        minWidth: DASHBOARD_LIST_COLUMN_WIDTHS.BUTTONS,
        flex: isColumnHeader ? 1 : 1,
        '.MuiButton-root': {
          ml: '6px',
          // Restore a min-width floor for the row action buttons (the theme no longer floors
          // button min-width globally) so they keep their prior size instead of shrinking to bare
          // label width.
          minWidth: 64,
        },
      }}
    >
      {children}
    </Box>
  );
};
