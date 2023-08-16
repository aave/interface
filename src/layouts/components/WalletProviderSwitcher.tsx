import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import React, { useState } from 'react';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/mixPanelEvents';

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const walletProviderEnabledId = 'walletProviderEnabled';

export const WalletProviderSwitcher = ({ component = ListItem }: DarkModeSwitcherProps) => {
  const walletProviderEnabledLocalStorage =
    localStorage.getItem(walletProviderEnabledId) === 'true' || false;
  const [walletProviderEnabled, setWalletProviderEnabled] = useState(
    walletProviderEnabledLocalStorage
  );

  const toggleWalletProviderEnabled = () => {
    setWalletProviderEnabled((walletProviderEnabled) => {
      localStorage.setItem(walletProviderEnabledId, `${!walletProviderEnabled}`);
      return !walletProviderEnabled;
    });
  };
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      component={component}
      onClick={toggleWalletProviderEnabled}
      sx={{
        cursor: 'pointer',
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Use wallet provider</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="walletProviderEnabled"
        control={
          <Switch
            disableRipple
            onClick={() => trackEvent(SETTINGS.TESTNET_MODE)}
            checked={walletProviderEnabled}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={walletProviderEnabled ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
