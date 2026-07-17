import { PlusIcon } from '@heroicons/react/outline';
import { Button, SvgIcon } from '@mui/material';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const VARIANTS = ['contained', 'outlined', 'text'] as const;
const SIZES = ['small', 'medium', 'large'] as const;

export const ButtonsSection = () => (
  <Section
    title="Buttons"
    description="variant × size. Hover/focus are interaction-only; the disabled and icon states are shown per row."
  >
    {VARIANTS.map((variant) => (
      <Specimen key={variant} label={variant} fullWidth>
        {SIZES.map((size) => (
          <Button key={size} variant={variant} color="primary" size={size}>
            {size}
          </Button>
        ))}
        <Button variant={variant} color="primary" disabled>
          disabled
        </Button>
        <Button
          variant={variant}
          color="primary"
          startIcon={
            <SvgIcon>
              <PlusIcon />
            </SvgIcon>
          }
        >
          icon
        </Button>
      </Specimen>
    ))}
  </Section>
);
