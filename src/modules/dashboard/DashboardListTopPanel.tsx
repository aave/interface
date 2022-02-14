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
      sx={{
        display: 'flex',
        alignItems: { xxs: 'flex-start', xs: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xxs: 'column-reverse', xs: 'row' },
        px: 6,
        py: 2,
        pl: '27px',
      }}
    >
      <FormControlLabel
        sx={{ mt: { xxs: bridge ? 2 : 0, xs: 0 } }}
        control={<Checkbox sx={{ p: '6px' }} />}
        checked={value}
        onChange={() => toggleLocalStorageClick(value, onClick, localStorageName)}
        label={<Trans>Show assets with 0 balance</Trans>}
      />

      <BridgeButton bridge={bridge} variant="outlined" />
    </Box>
  );
};
