import { Box, Button, Checkbox, ListItemText, Menu, MenuItem } from '@mui/material';
import { ReactNode, useState } from 'react';
import { FilterLinesIcon } from 'src/components/icons/FilterLinesIcon';
import { startIconSizeSx } from 'src/utils/buttonStyles';

export interface ConfigFilterOption {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface ConfigFilterButtonProps {
  label: ReactNode;
  options: ConfigFilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const ConfigFilterButton = ({
  label,
  options,
  selected,
  onChange,
}: ConfigFilterButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]);
  };

  return (
    <>
      <Button
        variant="tertiary"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        disabled={options.length === 0}
        aria-haspopup="true"
        aria-expanded={open}
        startIcon={<FilterLinesIcon />}
        sx={{ height: '2rem', ...startIconSizeSx('1.125rem') }}
      >
        {label}
        {selected.length > 0 && (
          <Box component="span" sx={{ ml: '0.25rem', color: 'fg-3' }}>
            ({selected.length})
          </Box>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { maxHeight: '20rem', minWidth: '12rem' } } }}
      >
        {options.map((option) => {
          const checked = selected.includes(option.key);
          return (
            <MenuItem
              key={option.key}
              onClick={() => toggle(option.key)}
              role="menuitemcheckbox"
              aria-checked={checked}
              sx={{ gap: '0.5rem' }}
            >
              <Checkbox
                checked={checked}
                inputProps={{ readOnly: true, tabIndex: -1, 'aria-hidden': true }}
                sx={{ p: 0, pointerEvents: 'none' }}
              />
              {option.icon}
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
