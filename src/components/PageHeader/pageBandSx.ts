import { SxProps, Theme } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

/**
 * The outer band shared by the two page-header components (`PageHeader` and `TopInfoPanel`):
 * vertical rhythm, ink colour, surface, and the bottom hairline. Defined once so the two can't
 * drift — they have twice been edited in lockstep.
 */
export const pageBandSx: SxProps<Theme> = {
  pt: { xs: 10, md: 12 },
  pb: { xs: 10, md: 12 },
  color: 'fg-1',
  boxShadow: `0px 1px 0px ${figVars['border-0']}`,
  bgcolor: 'bg-3',
};
