import { Trans } from '@lingui/macro';
import { FormControlLabel, ListItem, ListItemText, Switch } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';

import { ColorModeContext } from '../AppGlobalStyles';

export const DarkModeSwitcher = () => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <ListItem
      onClick={colorMode.toggleColorMode}
      sx={{ color: { xxs: 'common.white', md: 'text.primary' }, py: { xxs: 1.5, md: 2 } }}
    >
      <ListItemText>
        <Trans>Dark mode</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="darkmode"
        control={
          <Switch
            disableRipple
            checked={theme.palette.mode === 'dark'}
            sx={{ '.MuiSwitch-track': { bgcolor: { xxs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={theme.palette.mode === 'dark' ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </ListItem>
  );
};
