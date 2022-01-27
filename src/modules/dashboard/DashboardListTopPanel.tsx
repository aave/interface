import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormControlLabel } from '@mui/material';

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
  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 6, py: 2 }}
    >
      <FormControlLabel
        control={<Checkbox />}
        checked={value}
        onChange={() => toggleLocalStorageClick(value, onClick, localStorageName)}
        label={<Trans>Show assets with 0 balance</Trans>}
      />

      <BridgeButton bridge={bridge} variant="outlined" />
    </Box>
  );
};
