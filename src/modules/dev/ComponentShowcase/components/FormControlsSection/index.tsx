import {
  Box,
  Checkbox,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { SearchInput } from 'src/components/SearchInput';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const SelectDemo = () => {
  const [value, setValue] = useState('ethereum');
  return (
    <Select
      value={value}
      onChange={(e: SelectChangeEvent) => setValue(e.target.value)}
      size="small"
      sx={{ minWidth: 160 }}
    >
      <MenuItem value="ethereum">Ethereum</MenuItem>
      <MenuItem value="base">Base</MenuItem>
      <MenuItem value="arbitrum">Arbitrum</MenuItem>
    </Select>
  );
};

export const FormControlsSection = () => (
  <Section title="Form controls">
    <Specimen label="Checkbox — unchecked / checked / indeterminate / disabled">
      <Checkbox />
      <Checkbox defaultChecked />
      <Checkbox indeterminate />
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
    </Specimen>

    <Specimen label="Switch — off / on / disabled">
      <Switch />
      <Switch defaultChecked />
      <Switch disabled />
      <Switch disabled defaultChecked />
    </Specimen>

    <Specimen label="Select">
      <SelectDemo />
    </Specimen>

    <Specimen label="TextField">
      <TextField placeholder="Amount" size="small" />
      <TextField placeholder="Disabled" size="small" disabled />
    </Specimen>

    <Specimen label="Slider" fullWidth>
      <Box sx={{ width: 240 }}>
        <Slider defaultValue={40} />
      </Box>
      <Box sx={{ width: 240 }}>
        <Slider defaultValue={40} disabled />
      </Box>
    </Specimen>

    <Specimen label="SearchInput">
      <SearchInput placeholder="Search assets" onSearchTermChange={() => undefined} />
    </Specimen>
  </Section>
);
