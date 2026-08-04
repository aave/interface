import { Box, Typography } from '@mui/material';
import { FigmaColorName, figVars } from 'src/utils/figmaColors';

import { HEX_TEXT, tokenHex } from '../../../../utils/tokenHex';

export interface LadderStep {
  token: FigmaColorName;
  /** Where this step sits in the interaction, e.g. "base", "hover", "open". */
  label: string;
}

/**
 * TEMPORARY (delete with `ColorRegressionSection`).
 *
 * A row of live token patches with their light/dark hexes printed underneath. Two uses:
 * - **Hover ladders** (`seamless={false}`) — read left-to-right to see whether each step gets
 *   darker or lighter than the one before it, without having to hover the real control.
 * - **Adjacency checks** (`seamless`) — patches butt together with no gap, so two tokens that now
 *   hold the same value show as one solid block with no visible seam.
 */
export const SwatchLadder = ({
  steps,
  seamless = false,
}: {
  steps: LadderStep[];
  seamless?: boolean;
}) => (
  <Box sx={{ display: 'flex', gap: seamless ? 0 : 3 }}>
    {steps.map(({ token, label }, i) => {
      const hex = tokenHex(token);
      // Seamless rounds only the run's outer corners, so it reads as one continuous strip.
      const first = i === 0;
      const last = i === steps.length - 1;

      return (
        <Box key={`${token}-${label}`} sx={{ width: 130 }}>
          <Box
            sx={{
              height: 56,
              backgroundColor: token,
              boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
              borderRadius: seamless
                ? `${first ? '8px' : 0} ${last ? '8px' : 0} ${last ? '8px' : 0} ${
                    first ? '8px' : 0
                  }`
                : '8px',
            }}
          />
          <Typography variant="main12" sx={{ mt: 2, display: 'block' }}>
            {label}
          </Typography>
          <Typography variant="helperText" color="fg-2" sx={{ display: 'block' }}>
            {token}
          </Typography>
          <Typography variant="helperText" color="fg-3" sx={{ ...HEX_TEXT, display: 'block' }}>
            {hex.light} / {hex.dark}
          </Typography>
        </Box>
      );
    })}
  </Box>
);
