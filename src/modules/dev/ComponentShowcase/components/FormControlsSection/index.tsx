import {
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { SearchInput } from 'src/components/SearchInput';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

// Showcase-only: render Select menus inline (disablePortal) so they inherit the showcase's LOCAL
// `data-mui-color-scheme` box instead of escaping to <body> and following the app's global scheme.
const SELECT_MENU_PROPS = { disablePortal: true } as const;

// Shared option set for the Select demos below.
const NETWORKS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'arbitrum', label: 'Arbitrum' },
];

const networkMenuItems = NETWORKS.map((n) => (
  <MenuItem key={n.value} value={n.value}>
    {n.label}
  </MenuItem>
));

const SelectDemo = () => {
  const [value, setValue] = useState('ethereum');
  return (
    <Select
      value={value}
      onChange={(e: SelectChangeEvent) => setValue(e.target.value)}
      size="small"
      sx={{ minWidth: 160 }}
      MenuProps={SELECT_MENU_PROPS}
    >
      {networkMenuItems}
    </Select>
  );
};

const MultiSelectDemo = () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Select
      multiple
      displayEmpty
      value={value}
      onChange={(e: SelectChangeEvent<string[]>) => {
        const v = e.target.value;
        setValue(typeof v === 'string' ? v.split(',') : v);
      }}
      size="small"
      sx={{ minWidth: 220 }}
      MenuProps={SELECT_MENU_PROPS}
      renderValue={(selected) =>
        selected.length === 0 ? (
          <Box component="span" sx={{ color: 'fg-3' }}>
            Select networks
          </Box>
        ) : (
          selected.map((v) => NETWORKS.find((n) => n.value === v)?.label ?? v).join(', ')
        )
      }
    >
      {networkMenuItems}
    </Select>
  );
};

export const FormControlsSection = () => (
  <Section title="Form controls">
    <Specimen
      label="TextField — placeholder / value / disabled / error / label / adornment / multiline"
      fullWidth
      align="flex-start"
    >
      <TextField placeholder="Amount" size="small" />
      <TextField defaultValue="1000.00" size="small" />
      <TextField placeholder="Disabled" size="small" disabled />
      <TextField defaultValue="oops" size="small" error helperText="Invalid amount" />
      <TextField label="Label" size="small" />
      <TextField
        placeholder="0.00"
        size="small"
        InputProps={{ endAdornment: <InputAdornment position="end">USDC</InputAdornment> }}
      />
      <TextField placeholder="Notes" size="small" multiline rows={2} />
    </Specimen>

    <Specimen label="Select — default / disabled / multiple" fullWidth>
      <SelectDemo />
      <Select
        defaultValue="ethereum"
        size="small"
        disabled
        sx={{ minWidth: 160 }}
        MenuProps={SELECT_MENU_PROPS}
      >
        {networkMenuItems}
      </Select>
      <MultiSelectDemo />
    </Specimen>

    <Specimen
      label="Checkbox — unchecked / checked / indeterminate / disabled / disabled-checked / labeled"
      fullWidth
    >
      <Checkbox />
      <Checkbox defaultChecked />
      <Checkbox indeterminate />
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
      <FormControlLabel control={<Checkbox defaultChecked />} label="With label" />
    </Specimen>

    <Specimen label="Radio — unselected / selected / disabled / disabled-checked" fullWidth>
      <Radio />
      <Radio defaultChecked />
      <Radio disabled />
      <Radio defaultChecked disabled />
    </Specimen>

    <Specimen label="RadioGroup — labeled" fullWidth>
      <RadioGroup defaultValue="market" row>
        <FormControlLabel value="market" control={<Radio />} label="Market" />
        <FormControlLabel value="limit" control={<Radio />} label="Limit" />
        <FormControlLabel value="disabled" control={<Radio />} label="Disabled" disabled />
      </RadioGroup>
    </Specimen>

    <Specimen label="Switch — off / on / disabled / disabled-checked / labeled" fullWidth>
      <Switch />
      <Switch defaultChecked />
      <Switch disabled />
      <Switch disabled defaultChecked />
      <FormControlLabel control={<Switch defaultChecked />} label="With label" />
    </Specimen>

    <Specimen label="SearchInput (type to reveal the clear button)" fullWidth>
      <SearchInput
        placeholder="Search assets"
        onSearchTermChange={() => undefined}
        wrapperSx={{ width: { xs: '100%', sm: 320 } }}
      />
    </Specimen>
  </Section>
);
