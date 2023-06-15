import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { FaucetButton } from 'src/components/FaucetButton';
import { useRootStore } from 'src/store/root';
import { ENABLE_TESTNET, STAGING_ENV } from 'src/utils/marketsAndNetworksConfig';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { BridgeButton } from '../../components/BridgeButton';
import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';
import { NetworkConfig } from '../../ui-config/networksConfig';

interface DashboardListTopPanelProps extends Pick<NetworkConfig, 'bridge'> {
  value: boolean;
  onClick: (value: boolean) => void;
  localStorageName: string;
}

export const DashboardListTopPanel = ({
  value,
  onClick,
  localStorageName,
  bridge,
}: DashboardListTopPanelProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column-reverse', xsm: 'row' },
        px: { xs: 4, xsm: 6 },
        py: 2,
        pl: { xs: '18px', xsm: '27px' },
      }}
    >
      <FormControlLabel
        sx={{ mt: { xs: bridge ? 2 : 0, xsm: 0 } }}
        control={<Checkbox sx={{ p: '6px' }} />}
        checked={value}
        onChange={() => {
          trackEvent(DASHBOARD.SHOW_ASSETS_0_BALANCE, {});

          toggleLocalStorageClick(value, onClick, localStorageName);
        }}
        label={<Trans>Show assets with 0 balance</Trans>}
      />

      {(STAGING_ENV || ENABLE_TESTNET) && <FaucetButton />}
      {!ENABLE_TESTNET && <BridgeButton bridge={bridge} />}
    </Box>
  );
};
