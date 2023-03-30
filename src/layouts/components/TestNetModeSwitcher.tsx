import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import React, { useState } from 'react';

interface TestNetModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const TestNetModeSwitcher = ({ component = ListItem }: TestNetModeSwitcherProps) => {
  const testnetsEnabledId = 'testnetsEnabled';
  const testnetsEnabledLocalstorage = localStorage.getItem(testnetsEnabledId) === 'true' || false;
  const [testnetsEnabled, setTestnetsMode] = useState(testnetsEnabledLocalstorage);

  const toggleTestnetsEnabled = () => {
    const newState = !testnetsEnabled;
    setTestnetsMode(!testnetsEnabled);
    localStorage.setItem(testnetsEnabledId, newState ? 'true' : 'false');
    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  return (
    <Box
      component={component}
      onClick={toggleTestnetsEnabled}
      sx={{
        cursor: 'pointer',
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}>
        <Trans>Testnet mode</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="testnetsMode"
        control={
          <Switch
            disableRipple
            checked={testnetsEnabled}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: 'primary.light', md: 'primary.light' } } }}
          />
        }
        label={testnetsEnabled ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
