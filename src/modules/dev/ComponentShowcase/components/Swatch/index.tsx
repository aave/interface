import { Box } from '@mui/material';
import { FigmaColorName, figVars } from 'src/utils/figmaColors';

import { TokenHexLabel } from '../TokenHexLabel';

interface SwatchProps {
  name: FigmaColorName;
  value: string;
}

// A checkerboard backing so alpha tokens (borders/shadows/scrim) stay visible.
const CHECKERBOARD = {
  backgroundImage:
    'linear-gradient(45deg, #c4c4c4 25%, transparent 25%), linear-gradient(-45deg, #c4c4c4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #c4c4c4 75%), linear-gradient(-45deg, transparent 75%, #c4c4c4 75%)',
  backgroundSize: '12px 12px',
  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
};

export const Swatch = ({ name, value }: SwatchProps) => (
  <Box sx={{ width: 132 }}>
    <Box
      sx={{
        height: 56,
        borderRadius: '8px',
        border: `1px solid ${figVars['border-2']}`,
        position: 'relative',
        overflow: 'hidden',
        ...CHECKERBOARD,
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, backgroundColor: value }} />
    </Box>
    <TokenHexLabel name={name} />
  </Box>
);
