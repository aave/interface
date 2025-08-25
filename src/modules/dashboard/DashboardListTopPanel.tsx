import { Box, Checkbox, FormControlLabel, SxProps } from '@mui/material';
import { FaucetButton } from 'src/components/FaucetButton';
import { useRootStore } from 'src/store/root';

import { BridgeButton } from '../../components/BridgeButton';
import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';
import { NetworkConfig } from '../../ui-config/networksConfig';

interface DashboardListTopPanelProps extends Pick<NetworkConfig, 'bridge'> {
  value: boolean;
  onClick: (value: boolean) => void;
  localStorageName: string;
  eventName: string;
  label: React.ReactNode;
  showFaucet: boolean;
  showBridge: boolean;
  sx?: SxProps;
}

export const DashboardListTopPanel = ({
  value,
  onClick,
  localStorageName,
  bridge,
  eventName,
  label,
  showFaucet,
  showBridge,
  sx,
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
        ...sx,
      }}
    >
      <FormControlLabel
        sx={{ mt: { xs: bridge ? 2 : 0, xsm: 0 } }}
        control={<Checkbox sx={{ p: '6px' }} />}
        checked={value}
        onChange={() => {
          trackEvent(eventName, {});

          toggleLocalStorageClick(value, onClick, localStorageName);
        }}
        label={label}
      />

      {showFaucet && <FaucetButton />}
      {showBridge && <BridgeButton bridge={bridge} />}
    </Box>
  );
};
