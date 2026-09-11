import { Trans } from '@lingui/macro';
import { ListItem, MenuItem } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

import { SettingSwitchRow } from './SettingSwitchRow';

interface ShieldSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const ShieldSwitcher = ({ component = ListItem }: ShieldSwitcherProps) => {
  const shieldEnabled = useRootStore((store) => store.shieldEnabled);
  const toggleShield = useRootStore((store) => store.toggleShield);
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <SettingSwitchRow
      component={component}
      label={<Trans>Aave Shield</Trans>}
      checked={shieldEnabled}
      onClick={() => {
        const newValue = !shieldEnabled;
        toggleShield();
        trackEvent(SETTINGS.SHIELD_TOGGLE, { enabled: newValue });
      }}
    />
  );
};
