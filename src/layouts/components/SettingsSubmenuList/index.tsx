import { Trans } from '@lingui/macro';
import { Box, ListItem, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { ReactNode } from 'react';
import { CheckIcon } from 'src/components/icons/CheckIcon';
import { ChevronLeftIcon } from 'src/components/icons/ChevronLeftIcon';

// Chevron/icon-to-label gap, per the design spec — the Back row runs 2px wider than an option.
const BACK_ICON_SX = { mr: '0.625rem', color: 'fg-chevron' };
const OPTION_ICON_SX = { mr: '0.5rem', color: 'fg-3' };
const ROW_SX = { cursor: 'pointer', color: 'fg-1' };

interface SettingsSubmenuOption {
  key: string;
  icon: ReactNode;
  label: ReactNode;
}

interface SettingsSubmenuListProps {
  component?: typeof MenuItem | typeof ListItem;
  options: SettingsSubmenuOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onBack: () => void;
}

// The body of a settings submenu: a Back row, then one selectable option per entry — icon,
// label, and a check on the active one. Shared by the Language and Theme submenus.
export const SettingsSubmenuList = ({
  component = ListItem,
  options,
  selectedKey,
  onSelect,
  onBack,
}: SettingsSubmenuListProps) => (
  <>
    <Box component={component} onClick={onBack} sx={{ ...ROW_SX, color: 'fg-3', mb: '4px' }}>
      <ListItemIcon sx={BACK_ICON_SX}>
        <ChevronLeftIcon sx={{ fontSize: '1.125rem' }} />
      </ListItemIcon>
      {/* Plain ListItemText (not a `base` Typography behind `disableTypography`) so the label
          carries `.MuiListItemText-primary` like every other row — that's the hook the mobile
          drawer scales its rows by, and without it Back stayed at the desktop 14px. */}
      <ListItemText primaryTypographyProps={{ sx: { lineHeight: '1.125rem' } }}>
        <Trans>Back</Trans>
      </ListItemText>
    </Box>

    {options.map((option) => (
      <Box component={component} key={option.key} onClick={() => onSelect(option.key)} sx={ROW_SX}>
        <ListItemIcon sx={OPTION_ICON_SX}>{option.icon}</ListItemIcon>
        <ListItemText>{option.label}</ListItemText>
        {option.key === selectedKey && (
          <ListItemIcon sx={{ m: 0, color: 'purple-1' }}>
            <CheckIcon sx={{ fontSize: '1.25rem' }} />
          </ListItemIcon>
        )}
      </Box>
    ))}
  </>
);
