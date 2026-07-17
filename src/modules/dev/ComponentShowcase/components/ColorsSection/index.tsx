import { Box, Typography, useTheme } from '@mui/material';

import { SWATCH_GROUPS } from '../../utils/catalog';
import { Section } from '../Section';
import { Swatch } from '../Swatch';

export const ColorsSection = () => {
  const { palette } = useTheme();

  return (
    <Section
      title="Color tokens"
      description="theme.palette.fig, resolved for the active mode. Flip the theme toggle to see both."
    >
      {SWATCH_GROUPS.map((group) => (
        <Box key={group.title} sx={{ flex: '1 1 100%' }}>
          <Typography variant="subheader1" sx={{ mb: 3, display: 'block' }}>
            {group.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {group.names.map((name) => (
              <Swatch key={name} name={name} value={palette.fig[name]} />
            ))}
          </Box>
        </Box>
      ))}
    </Section>
  );
};
