import { Box, ListItem, ListItemText, MenuItem, Switch } from '@mui/material';
import { ReactNode } from 'react';
import { figmaDark } from 'src/utils/figmaColors';

interface SettingSwitchRowProps {
  component?: typeof MenuItem | typeof ListItem;
  label: ReactNode;
  checked: boolean;
  onClick: () => void;
  // Optional switch-specific click (e.g. analytics) — fires in addition to the row `onClick`.
  onSwitchClick?: () => void;
}

// A settings-menu row: label on the left, toggle on the right. Shared by the dark-mode /
// shield / testnet switchers, which render in both the desktop settings menu and the
// (always-dark) mobile drawer — hence the responsive text/track colors.
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
      color: { xs: '#F1F1F3', md: 'fg-1' },
      py: { xs: 1.5, md: 2 },
    }}
  >
    <ListItemText>{label}</ListItemText>
    <Switch
      disableRipple
      checked={checked}
      onClick={onSwitchClick}
      sx={{ '.MuiSwitch-track': { bgcolor: { xs: figmaDark['border-2'], md: 'primary.light' } } }}
    />
  </Box>
);
