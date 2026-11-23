import { Trans } from '@lingui/macro';
import { Button, ListItemText, Menu, MenuItem } from '@mui/material';
import { MouseEvent, useState } from 'react';

const FRACTIONS = [0.25, 0.5, 0.75];

interface PercentSelectorProps {
  disabled?: boolean;
  onSelectPercent: (fraction: number) => void;
}

export const PercentSelector = ({ disabled, onSelectPercent }: PercentSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePick = (fraction: number) => {
    onSelectPercent(fraction);
    handleClose();
  };

  return (
    <>
      <Button
        size="small"
        sx={{
          minWidth: 0,
          p: 0,
          my: '-0.25rem',
          fontWeight: 400,
          color: 'fg-3',
          '&:hover': { backgroundColor: 'transparent', color: 'fg-1' },
          '&.Mui-disabled': { color: 'fg-4' },
        }}
        onClick={handleOpen}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Trans>%</Trans>
      </Button>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { '&&': { mt: 0 } } } }}
        MenuListProps={{ sx: { display: 'flex' } }}
      >
        {FRACTIONS.map((fraction) => (
          <MenuItem key={fraction} onClick={() => handlePick(fraction)}>
            <ListItemText sx={{ fontWeight: 500 }}>{Math.round(fraction * 100)}%</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
