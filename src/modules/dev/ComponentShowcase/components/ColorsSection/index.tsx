import { Box, Typography } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

import { SWATCH_GROUPS } from '../../utils/catalog';
import { Section } from '../Section';
import { Swatch } from '../Swatch';

export const ColorsSection = () => {
  return (
    <Section
      title="Color tokens"
      description="Flattened palette design tokens, as CSS vars. Flip the theme toggle to see both."
    >
      {SWATCH_GROUPS.map((group) => (
        <Box key={group.title} sx={{ flex: '1 1 100%' }}>
          <Typography variant="subheader1" sx={{ mb: 3, display: 'block' }}>
            {group.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {group.names.map((name) => (
              <Swatch key={name} name={name} value={figVars[name]} />
            ))}
          </Box>
        </Box>
      ))}
    </Section>
  );
};
