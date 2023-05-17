import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';

interface CustomRPCSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const CustomRPCSwitcher: React.FC<CustomRPCSwitcherProps> = ({ component = ListItem }) => {
  const localStorage = global?.window?.localStorage;
  const rpcSetup = localStorage.getItem('rpcSetUp') === 'true';
  const checked = localStorage.getItem('usingCustomRPC') === 'true';

  const handleCLick = () => {
    if (checked) localStorage.removeItem('usingCustomRPC');
    else localStorage.setItem('usingCustomRPC', 'true');

    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  return rpcSetup ? (
    <Box
      component={component}
      onClick={handleCLick}
      sx={{
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Custom RPC</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="usingCustomRPC"
        control={
          <Switch
            disableRipple
            checked={checked}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={checked ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  ) : null;
};
