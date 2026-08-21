import { Typography } from '@mui/material';
import { FigmaColorName } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

import { HEX_TEXT, tokenHex } from '../../utils/tokenHex';

// The scheme being rendered gets fg-2, the other fg-4 — so it's unambiguous which value the swatch
// above is actually painting, while both stay readable for checking against Figma without toggling.
// Hoisted: neither depends on props, and every swatch on the colors page renders two of them.
const ACTIVE = { ...HEX_TEXT, display: 'block', color: 'fg-2', ...darkScheme({ color: 'fg-4' }) };
const INACTIVE = { ...HEX_TEXT, display: 'block', color: 'fg-4', ...darkScheme({ color: 'fg-2' }) };

/**
 * Token name plus BOTH modes' source values. Shared by every specimen that labels a color token, so
 * the showcase reports hexes one way instead of one way per component.
 */
export const TokenHexLabel = ({ name }: { name: FigmaColorName }) => {
  const { light, dark } = tokenHex(name);

  return (
    <>
      <Typography variant="main12" noWrap sx={{ mt: 3, display: 'block' }}>
        {name}
      </Typography>
      <Typography variant="helperText" noWrap sx={{ ...ACTIVE, mt: 1 }}>
        {light}
      </Typography>
      <Typography variant="helperText" noWrap sx={INACTIVE}>
        {dark}
      </Typography>
    </>
  );
};
