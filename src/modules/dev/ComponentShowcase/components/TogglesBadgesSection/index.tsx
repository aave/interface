import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { BadgeSize, ExclamationBadge } from 'src/components/badges/ExclamationBadge';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const TxToggleDemo = () => {
  const [value, setValue] = useState('market');
  return (
    <StyledTxModalToggleGroup value={value} exclusive onChange={(_, v) => v && setValue(v)}>
      <StyledTxModalToggleButton value="market">
        <Typography variant="buttonM">Market</Typography>
      </StyledTxModalToggleButton>
      <StyledTxModalToggleButton value="limit">
        <Typography variant="buttonM">Limit</Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};

export const TogglesBadgesSection = () => (
  <Section title="Toggles & badges">
    <Specimen label="StyledTxModalToggleGroup">
      <Box sx={{ width: 240 }}>
        <TxToggleDemo />
      </Box>
    </Specimen>

    <Specimen label="ExclamationBadge (SM / MD)">
      <ExclamationBadge size={BadgeSize.SM} />
      <ExclamationBadge size={BadgeSize.MD} />
    </Specimen>
  </Section>
);
