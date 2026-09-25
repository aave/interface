import { Box, ListItem, ListItemText, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';

interface SettingsNavRowProps {
  component?: typeof MenuItem | typeof ListItem;
  label: ReactNode;
  value: ReactNode;
  onClick: () => void;
}

// A settings-menu row that drills into a submenu: label on the left, the current value and a
// disclosure chevron on the right. Shared by the Language and Theme rows, in both the desktop
// settings menu and the mobile drawer.
export const SettingsNavRow = ({
  component = ListItem,
  label,
  value,
  onClick,
}: SettingsNavRowProps) => (
  <Box component={component} onClick={onClick} sx={{ cursor: 'pointer', color: 'fg-1' }}>
    <ListItemText>{label}</ListItemText>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'fg-3' }}>
      <ListItemText>{value}</ListItemText>
      <ChevronRightIcon sx={{ fontSize: '1.25rem', color: 'fg-chevron' }} />
    </Box>
  </Box>
);
