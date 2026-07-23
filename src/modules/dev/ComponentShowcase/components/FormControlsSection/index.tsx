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
  Slider,
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
      <MenuItem value="ethereum">Ethereum</MenuItem>
      <MenuItem value="base">Base</MenuItem>
      <MenuItem value="arbitrum">Arbitrum</MenuItem>
    </Select>
  );
};

const MultiSelectDemo = () => {
  const [value, setValue] = useState<string[]>(['ethereum', 'base']);
  return (
    <Select
      multiple
      value={value}
      onChange={(e: SelectChangeEvent<string[]>) => {
        const v = e.target.value;
        setValue(typeof v === 'string' ? v.split(',') : v);
      }}
      size="small"
      sx={{ minWidth: 220 }}
      MenuProps={SELECT_MENU_PROPS}
    >
      <MenuItem value="ethereum">Ethereum</MenuItem>
      <MenuItem value="base">Base</MenuItem>
      <MenuItem value="arbitrum">Arbitrum</MenuItem>
    </Select>
  );
};

// Sliders need a bounded width; full-width on mobile, 220px (and wrapping) on larger screens.
const sliderBox = { width: { xs: '100%', sm: 220 } };

export const FormControlsSection = () => (
  <Section title="Form controls">
    <Specimen
      label="TextField — placeholder / value / disabled / error / label / adornment / multiline"
      fullWidth
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

    <Specimen label="Select — default / disabled / multiple">
      <SelectDemo />
      <Select
        defaultValue="ethereum"
        size="small"
        disabled
        sx={{ minWidth: 160 }}
        MenuProps={SELECT_MENU_PROPS}
      >
        <MenuItem value="ethereum">Ethereum</MenuItem>
      </Select>
      <MultiSelectDemo />
    </Specimen>

    <Specimen label="Checkbox — unchecked / checked / indeterminate / disabled / disabled-checked / labeled">
      <Checkbox />
      <Checkbox defaultChecked />
      <Checkbox indeterminate />
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
      <FormControlLabel control={<Checkbox defaultChecked />} label="With label" />
    </Specimen>

    <Specimen label="Radio — unselected / selected / disabled / disabled-checked">
      <Radio />
      <Radio defaultChecked />
      <Radio disabled />
      <Radio defaultChecked disabled />
    </Specimen>

    <Specimen label="RadioGroup — labeled">
      <RadioGroup defaultValue="market" row>
        <FormControlLabel value="market" control={<Radio />} label="Market" />
        <FormControlLabel value="limit" control={<Radio />} label="Limit" />
        <FormControlLabel value="disabled" control={<Radio />} label="Disabled" disabled />
      </RadioGroup>
    </Specimen>

    <Specimen label="Switch — off / on / disabled / disabled-checked / labeled">
      <Switch />
      <Switch defaultChecked />
      <Switch disabled />
      <Switch disabled defaultChecked />
      <FormControlLabel control={<Switch defaultChecked />} label="With label" />
    </Specimen>

    <Specimen label="Slider — default / disabled / marks / range / value-label / small" fullWidth>
      <Box sx={sliderBox}>
        <Slider defaultValue={40} />
      </Box>
      <Box sx={sliderBox}>
        <Slider defaultValue={40} disabled />
      </Box>
      <Box sx={sliderBox}>
        <Slider defaultValue={40} step={10} marks min={0} max={100} />
      </Box>
      <Box sx={sliderBox}>
        <Slider defaultValue={[20, 60]} />
      </Box>
      <Box sx={sliderBox}>
        <Slider defaultValue={40} valueLabelDisplay="auto" />
      </Box>
      <Box sx={sliderBox}>
        <Slider defaultValue={40} size="small" />
      </Box>
    </Specimen>

    <Specimen label="SearchInput (type to reveal the clear button)">
      <SearchInput placeholder="Search assets" onSearchTermChange={() => undefined} />
    </Specimen>
  </Section>
);
