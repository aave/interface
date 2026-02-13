import {
  Box,
  Button,
  Checkbox,
  Input,
  MenuItem,
  Select,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export default function UIKitPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={3} gap={5}>
      <Typography variant="h2">UI Kit</Typography>

      <Typography variant="h4">Buttons</Typography>

      {/* buttons */}
      <Box display="flex" gap={2} alignItems="center">
        <Button variant="contained">asfd</Button>

        <Button color="secondary" variant="contained">
          asfd
        </Button>

        <Button size="small" color="info" variant="outlined">
          asfd
        </Button>

        <Button size="small" color="accent" variant="contained">
          asfd
        </Button>

        <Button size="small" color="info" variant="text">
          asfd
        </Button>
      </Box>

      {/* disabled */}
      <Box display="flex" gap={2} alignItems="center">
        <Button variant="contained" disabled>
          asfd
        </Button>

        <Button color="secondary" variant="contained" disabled>
          asfd
        </Button>

        <Button size="small" color="info" variant="outlined" disabled>
          asfd
        </Button>

        <Button size="small" color="accent" variant="contained" disabled>
          asfd
        </Button>

        <Button size="small" color="info" variant="text" disabled>
          asfd
        </Button>
      </Box>

      {/* loading */}
      <Box display="flex" gap={2} alignItems="center">
        <Button variant="contained" loading>
          asfd
        </Button>

        <Button color="secondary" variant="contained" loading>
          asfd
        </Button>

        <Button size="small" color="info" variant="outlined" loading>
          asfd
        </Button>

        <Button size="small" color="accent" variant="contained" loading>
          asfd
        </Button>

        <Button size="small" color="info" variant="text" loading>
          asfd
        </Button>
      </Box>

      <Typography variant="h4">Dropdown</Typography>

      <Box display="flex" gap={2} alignItems="center">
        <Select value="all" color="secondary">
          <MenuItem value="all">All Categories</MenuItem>
        </Select>

        <Select value="all" size="small" variant="outlined">
          <MenuItem value="all">ALL CATEGORIES</MenuItem>
        </Select>

        <Select value="on" color="accent" size="small">
          <MenuItem value="on">E-Mode ON</MenuItem>
        </Select>
      </Box>

      <Typography variant="h4">Checkbox</Typography>

      <Box display="flex" gap={2} alignItems="center">
        <Checkbox />
        <Checkbox checked />
      </Box>

      <Typography variant="h4">Switch</Typography>

      <Box display="flex" gap={2} alignItems="center">
        <Switch />
        <Switch checked />
      </Box>

      <Typography variant="h4">Segmented Control</Typography>

      <Box display="flex" gap={2} alignItems="center">
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Item One" disableFocusRipple disableRipple disableTouchRipple />
          <Tab label="Item Two" disableFocusRipple disableRipple disableTouchRipple />
          <Tab label="Item Three" disableFocusRipple disableRipple disableTouchRipple />
        </Tabs>
      </Box>

      <Typography variant="h4">Input</Typography>

      <Box display="flex" gap={2} alignItems="center" mb={10}>
        <Input placeholder="Placeholder" />

        <Input value="Text" />

        <Input disabled placeholder="Placeholder" />

        <Input color="accent" value="Text" />
      </Box>
    </Box>
  );
}
