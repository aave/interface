import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface TestNetModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const TestNetModeSwitcher = ({ component = ListItem }: TestNetModeSwitcherProps) => {
  const router = useRouter();

  const testnetsEnabledId = 'testnetsEnabled';
  const testnetsEnabledLocalstorage = localStorage.getItem(testnetsEnabledId) === 'true' || false;
  const [testnetsEnabled, setTestnetsMode] = useState(testnetsEnabledLocalstorage);

  const toggleTestnetsEnabled = () => {
    const newState = !testnetsEnabled;
    setTestnetsMode(!testnetsEnabled);
    localStorage.setItem(testnetsEnabledId, newState ? 'true' : 'false');
    router.reload();
  };

  return (
    <Box
      component={component}
      onClick={toggleTestnetsEnabled}
      sx={{
        cursor: 'pointer',
        color: { xs: 'common.white', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Enable Testnet mode</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="testnetsMode"
        control={
          <Switch
            disableRipple
            checked={testnetsEnabled}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={testnetsEnabled ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
