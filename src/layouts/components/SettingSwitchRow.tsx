import { Box, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import { ReactNode } from 'react';

interface SettingSwitchRowProps {
  component?: typeof MenuItem | typeof ListItem;
  label: ReactNode;
  checked: boolean;
  onClick: () => void;
  // Optional switch-specific click (e.g. analytics) — fires in addition to the row `onClick`.
  onSwitchClick?: () => void;
}

// A settings-menu row: label on the left, toggle on the right. Shared by the dark-mode /
// shield / testnet switchers, rendered in both the desktop settings menu and the mobile drawer.
export const SettingSwitchRow = ({
  component = ListItem,
  label,
  checked,
  onClick,
  onSwitchClick,
}: SettingSwitchRowProps) => (
  <Box
    component={component}
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      color: 'fg-1',
      py: { xs: 1.5 },
    }}
  >
    <ListItemText>{label}</ListItemText>
    <Switch
      checked={checked}
      onClick={onSwitchClick}
      sx={{ '.MuiSwitch-track': { bgcolor: { mdlg: 'primary.light' } } }}
    />
  </Box>
);
