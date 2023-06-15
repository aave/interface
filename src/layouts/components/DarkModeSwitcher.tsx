import { Trans } from '@lingui/macro';
import {
  Box,
  FormControlLabel,
  ListItem,
  ListItemText,
  MenuItem,
  Switch,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/mixPanelEvents';

import { ColorModeContext } from '../AppGlobalStyles';

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const DarkModeSwitcher = ({ component = ListItem }: DarkModeSwitcherProps) => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      component={component}
      onClick={colorMode.toggleColorMode}
      sx={{
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Dark mode</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="darkmode"
        control={
          <Switch
            onClick={() => trackEvent(SETTINGS.DARK_MODE, { mode: theme.palette.mode })}
            disableRipple
            checked={theme.palette.mode === 'dark'}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={theme.palette.mode === 'dark' ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
