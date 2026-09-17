import { Typography } from '@mui/material';

import { TYPOGRAPHY_VARIANTS } from '../../utils/catalog';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

export const TypographySection = () => (
  <Section title="Typography" description="Every enabled variant (disabled MUI defaults omitted).">
    {TYPOGRAPHY_VARIANTS.map((variant) => (
      <Specimen key={variant} label={variant} fullWidth>
        <Typography variant={variant}>
          The quick brown fox jumps over the lazy dog — 1234567890
        </Typography>
      </Specimen>
    ))}
  </Section>
);
