import { Trans } from '@lingui/macro';
import { Box, FormControlLabel, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

interface ShieldSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const ShieldSwitcher = ({ component = ListItem }: ShieldSwitcherProps) => {
  const shieldEnabled = useRootStore((store) => store.shieldEnabled);
  const toggleShield = useRootStore((store) => store.toggleShield);
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      component={component}
      onClick={() => {
        const newValue = !shieldEnabled;
        toggleShield();
        trackEvent(SETTINGS.SHIELD_TOGGLE, { enabled: newValue });
      }}
      sx={{
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Aave Shield</Trans>
      </ListItemText>
      <FormControlLabel
        sx={{ mr: 0 }}
        value="shield"
        control={
          <Switch
            disableRipple
            checked={shieldEnabled}
            sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
          />
        }
        label={shieldEnabled ? 'On' : 'Off'}
        labelPlacement="start"
      />
    </Box>
  );
};
