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

import { ColorModeContext } from '../AppGlobalStyles';

interface DarkModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const DarkModeSwitcher = ({ component = ListItem }: DarkModeSwitcherProps) => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Box
      component={component}
      onClick={colorMode.toggleColorMode}
      sx={{
        color: '#F1F1F3',
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText sx={{ color: { xs: '#F1F1F3', md: 'text.primary' } }}>
        <Trans>Dark mode</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0, color: { xs: '#F1F1F3', md: 'text.primary' } }}
        value="darkmode"
        control={
          <Switch
            disableRipple
            checked={theme.palette.mode === 'dark'}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: 'primary.light', md: 'primary.light' } } }}
          />
        }
        label={theme.palette.mode === 'dark' ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
