import { Box, Typography } from '@mui/material';

import { COLOR_GROUPS } from '../../utils/catalog';
import { ColorSpecimen } from '../ColorSpecimen';
import { Section } from '../Section';

export const ColorsSection = () => {
  return (
    <Section
      title="Color tokens"
      description="Palette tokens shown the way they're used — text as text, backgrounds as surfaces, borders as dividers, shadows as shadows. Flip the theme toggle to see both."
    >
      {COLOR_GROUPS.map((group) => (
        <Box key={group.title} sx={{ flex: '1 1 100%', mb: 8 }}>
          <Typography variant="subheader1" sx={{ mb: 4, display: 'block' }}>
            {group.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.names.map((name) => (
              <ColorSpecimen key={name} role={group.role} name={name} />
            ))}
          </Box>
        </Box>
      ))}
    </Section>
  );
};
