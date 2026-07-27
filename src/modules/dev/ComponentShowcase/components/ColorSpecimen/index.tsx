import { Box, Typography } from '@mui/material';
import { FigmaColorName, figVars } from 'src/utils/figmaColors';

import { ColorRole } from '../../utils/catalog';
import { Swatch } from '../Swatch';

const SPECIMEN_WIDTH = 220;

// Token name + resolved CSS-var value, shown under every specimen.
const Label = ({ name, value }: { name: string; value: string }) => (
  <>
    <Typography variant="main12" noWrap sx={{ mt: 3, display: 'block' }}>
      {name}
    </Typography>
    <Typography variant="subheader2" color="fg-2" noWrap sx={{ mt: 0.5, display: 'block' }}>
      {value}
    </Typography>
  </>
);

/**
 * Renders a color token the way it's meant to be used: `text` colors as text, `bg` as a surface,
 * `border` as a divider inside a card, `shadow` as a drop shadow. Anything without a single obvious
 * use (`swatch`) falls back to the plain color chip.
 */
export const ColorSpecimen = ({ role, name }: { role: ColorRole; name: FigmaColorName }) => {
  const value = figVars[name];

  if (role === 'text') {
    // Framed on a surface so the sample sits with its label instead of floating on the page.
    return (
      <Box sx={{ width: SPECIMEN_WIDTH }}>
        <Box
          sx={{
            height: 88,
            display: 'flex',
            alignItems: 'center',
            px: 3,
            borderRadius: '10px',
            border: `1px solid ${figVars['border-2']}`,
          }}
        >
          <Typography variant="secondary16" noWrap sx={{ color: name }}>
            The quick brown fox
          </Typography>
        </Box>
        <Label name={name} value={value} />
      </Box>
    );
  }

  if (role === 'bg') {
    return (
      <Box sx={{ width: SPECIMEN_WIDTH }}>
        <Box
          sx={{
            height: 88,
            borderRadius: '10px',
            backgroundColor: name,
            border: `1px solid ${figVars['border-2']}`,
          }}
        />
        <Label name={name} value={value} />
      </Box>
    );
  }

  if (role === 'border') {
    // A two-row card split by the token, so it reads as a divider/separator.
    return (
      <Box sx={{ width: SPECIMEN_WIDTH }}>
        <Box
          sx={{
            borderRadius: '10px',
            border: `1px solid ${figVars['border-2']}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ height: 44 }} />
          <Box sx={{ borderTop: `1px solid ${value}` }} />
          <Box sx={{ height: 44 }} />
        </Box>
        <Label name={name} value={value} />
      </Box>
    );
  }

  if (role === 'shadow') {
    return (
      <Box sx={{ width: SPECIMEN_WIDTH }}>
        <Box
          sx={{
            height: 88,
            mt: 2,
            borderRadius: '10px',
            backgroundColor: 'surface-elevated',
            boxShadow: `0px 8px 24px 0px ${value}`,
          }}
        />
        <Label name={name} value={value} />
      </Box>
    );
  }

  return <Swatch name={name} value={value} />;
};
