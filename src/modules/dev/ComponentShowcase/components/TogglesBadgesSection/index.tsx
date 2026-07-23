import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { BadgeSize, ExclamationBadge } from 'src/components/badges/ExclamationBadge';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

interface ToggleOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const ToggleDemo = ({ options, initial }: { options: ToggleOption[]; initial: string }) => {
  const [value, setValue] = useState(initial);
  return (
    <StyledTxModalToggleGroup value={value} exclusive onChange={(_, v) => v && setValue(v)}>
      {options.map((o) => (
        <StyledTxModalToggleButton key={o.value} value={o.value} disabled={o.disabled}>
          <Typography variant="buttonM">{o.label}</Typography>
        </StyledTxModalToggleButton>
      ))}
    </StyledTxModalToggleGroup>
  );
};

export const TogglesBadgesSection = () => (
  <Section title="Toggles & badges">
    <Specimen label="Toggle group — 2 options">
      <Box sx={{ width: 240 }}>
        <ToggleDemo
          initial="market"
          options={[
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
          ]}
        />
      </Box>
    </Specimen>

    <Specimen label="Toggle group — 3 options">
      <Box sx={{ width: 240 }}>
        <ToggleDemo
          initial="1"
          options={[
            { value: '1', label: '1x' },
            { value: '2', label: '2x' },
            { value: '3', label: '3x' },
          ]}
        />
      </Box>
    </Specimen>

    <Specimen label="Toggle group — disabled segment">
      <Box sx={{ width: 240 }}>
        <ToggleDemo
          initial="supply"
          options={[
            { value: 'supply', label: 'Supply' },
            { value: 'borrow', label: 'Borrow', disabled: true },
          ]}
        />
      </Box>
    </Specimen>

    <Specimen label="ExclamationBadge (SM / MD)">
      <ExclamationBadge size={BadgeSize.SM} />
      <ExclamationBadge size={BadgeSize.MD} />
    </Specimen>
  </Section>
);
