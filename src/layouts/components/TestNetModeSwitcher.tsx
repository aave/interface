import { Trans } from '@lingui/macro';
import { ListItem, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useRootStore } from 'src/store/root';
import { SETTINGS } from 'src/utils/events';

import { SettingSwitchRow } from './SettingSwitchRow';

interface TestNetModeSwitcherProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const TestNetModeSwitcher = ({ component = ListItem }: TestNetModeSwitcherProps) => {
  const testnetsEnabledId = 'testnetsEnabled';
  const testnetsEnabledLocalstorage = localStorage.getItem(testnetsEnabledId) === 'true' || false;
  const [testnetsEnabled, setTestnetsMode] = useState(testnetsEnabledLocalstorage);
  const trackEvent = useRootStore((store) => store.trackEvent);

  const toggleTestnetsEnabled = () => {
    const newState = !testnetsEnabled;
    setTestnetsMode(!testnetsEnabled);
    localStorage.setItem(testnetsEnabledId, newState ? 'true' : 'false');
    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  return (
    <SettingSwitchRow
      component={component}
      label={<Trans>Testnet mode</Trans>}
      checked={testnetsEnabled}
      onClick={toggleTestnetsEnabled}
      onSwitchClick={() => trackEvent(SETTINGS.TESTNET_MODE)}
    />
  );
};
