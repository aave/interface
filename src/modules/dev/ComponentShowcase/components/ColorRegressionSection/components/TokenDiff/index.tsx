import { Box, Typography } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

import { HEX_TEXT, tokenHex } from '../../../../utils/tokenHex';
import { TokenDelta } from '../../utils/previousTokens';

const ROW_WIDTH = 300;

// `bg` tokens are surfaces, `fg` tokens are ink — the only difference between the two halves.
const PROP = { bg: 'backgroundColor', fg: 'color' } as const;

const HALF = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 52,
  boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
} as const;

/**
 * TEMPORARY (delete with `ColorRegressionSection`).
 *
 * One token's before/after, as two halves butted together with no seam: if the value didn't change
 * you see a single solid block, and any change reads as a visible edge down the middle. The `before`
 * half is painted from the hardcoded pre-change literal, swapped per scheme via `darkScheme` so it
 * tracks the showcase's LOCAL light/dark toggle; the `after` half reads the live token, which needs
 * no swap because the CSS var already resolves per scheme. Both values are printed through the
 * shared formatter so an unchanged token can't read as changed on a casing difference alone.
 */
export const TokenDiff = ({ delta, role }: { delta: TokenDelta; role: 'bg' | 'fg' }) => {
  const { name, prevLight, prevDark } = delta;
  const prop = PROP[role];
  const next = tokenHex(name);

  return (
    <Box sx={{ width: ROW_WIDTH }}>
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            ...HALF,
            [prop]: prevLight,
            borderRadius: '8px 0 0 8px',
            ...darkScheme({ [prop]: prevDark }),
          }}
        >
          {role === 'fg' && <Typography variant="secondary16">before</Typography>}
        </Box>
        <Box sx={{ ...HALF, [prop]: figVars[name], borderRadius: '0 8px 8px 0' }}>
          {role === 'fg' && <Typography variant="secondary16">after</Typography>}
        </Box>
      </Box>

      <Typography variant="main12" sx={{ mt: 2, display: 'block' }}>
        {name}
      </Typography>
      <Typography variant="helperText" color="fg-2" sx={{ ...HEX_TEXT, display: 'block', mt: 0.5 }}>
        light {prevLight.toUpperCase()} → {next.light}
      </Typography>
      <Typography variant="helperText" color="fg-2" sx={{ ...HEX_TEXT, display: 'block' }}>
        dark {prevDark.toUpperCase()} → {next.dark}
      </Typography>
    </Box>
  );
};
