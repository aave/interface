import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { Specimen } from '../../../Specimen';

interface RegressionCaseProps {
  /** What broke, in the app's terms — e.g. "Outlined / secondary pill button". */
  title: string;
  /** The token movement responsible, e.g. "bg-max light #ffffff → #f0f0f0". */
  cause: string;
  /** What to actually look at, so a "looks fine" verdict is a real check and not a guess. */
  check: string;
  /** Which mode(s) the change is visible in — the toggle needs to be on that scheme. */
  mode: 'light' | 'dark' | 'both';
  children: ReactNode;
}

const MODE_LABEL: Record<RegressionCaseProps['mode'], string> = {
  light: 'LIGHT ONLY',
  dark: 'DARK ONLY',
  both: 'BOTH MODES',
};

/**
 * TEMPORARY (delete with `ColorRegressionSection`).
 *
 * One suspected regression: the live component on a stage, with the causing token change and the
 * specific thing to look at. Deliberately verbose — the point is that each case can be signed off
 * or rejected without re-deriving why it's here. The stage itself is the showcase's `Specimen`, so
 * these frames match every other section instead of drifting into a second variant.
 */
export const RegressionCase = ({ title, cause, check, mode, children }: RegressionCaseProps) => (
  <Box sx={{ flex: '1 1 100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 3, flexWrap: 'wrap' }}>
      <Typography variant="subheader1">{title}</Typography>
      <Typography
        variant="helperText"
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: '4px',
          color: 'fg-2',
          backgroundColor: 'bg-6',
          letterSpacing: '0.05em',
        }}
      >
        {MODE_LABEL[mode]}
      </Typography>
    </Box>
    <Typography variant="helperText" color="fg-3" sx={{ display: 'block', mt: 1 }}>
      cause: {cause}
    </Typography>
    <Typography
      variant="description"
      color="fg-2"
      sx={{ display: 'block', mt: 1, mb: 3, maxWidth: 720 }}
    >
      {check}
    </Typography>
    <Specimen fullWidth>{children}</Specimen>
  </Box>
);
