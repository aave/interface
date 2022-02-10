import { Trans } from '@lingui/macro';
import { FormControlLabel, ListItem, ListItemText, Switch } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export const TestNetModeSwitcher = () => {
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
    <ListItem
      onClick={toggleTestnetsEnabled}
      sx={{ color: { xxs: 'common.white', md: 'text.primary' }, py: { xxs: 1.5, md: 2 } }}
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
            sx={{ '.MuiSwitch-track': { bgcolor: { xxs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={testnetsEnabled ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </ListItem>
  );
};
