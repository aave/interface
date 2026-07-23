import { ChevronRightIcon, PlusIcon } from '@heroicons/react/outline';
import { Button, SvgIcon } from '@mui/material';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const VARIANTS = ['contained', 'outlined', 'text'] as const;
const SIZES = ['small', 'medium', 'large'] as const;
const COLORS = ['primary', 'success', 'warning', 'error', 'secondary', 'info', 'inherit'] as const;

export const ButtonsSection = () => (
  <Section
    title="Buttons"
    description="variant × size, with disabled + start/end-icon states per row, then the MUI color set. Only `primary` is explicitly themed (the pill + contained-ink styles); other colors fall back to the MUI palette."
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
          start icon
        </Button>
        <Button
          variant={variant}
          color="primary"
          endIcon={
            <SvgIcon>
              <ChevronRightIcon />
            </SvgIcon>
          }
        >
          end icon
        </Button>
      </Specimen>
    ))}

    {(['contained', 'outlined'] as const).map((colorVariant) => (
      <Specimen key={colorVariant} label={`colors — ${colorVariant}`} fullWidth>
        {COLORS.map((color) => (
          <Button key={color} variant={colorVariant} color={color}>
            {color}
          </Button>
        ))}
      </Specimen>
    ))}
  </Section>
);
