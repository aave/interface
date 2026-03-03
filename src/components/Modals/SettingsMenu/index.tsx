import { RemoveRedEye } from '@mui/icons-material';
import { Divider, ListItemText, MenuItem, MenuList, Switch, Typography } from '@mui/material';
import { useState } from 'react';

import { MenuPaper, StyledMenu, UserSection } from './styles';

interface SettingsMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function SettingsMenu({ anchorEl, onClose }: SettingsMenuProps) {
  const [testnetMode, setTestnetMode] = useState(false);

  return (
    <StyledMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
      <MenuPaper>
        <UserSection>
          <ListItemText
            primary="John Doue"
            secondary="Global settings"
            primaryTypographyProps={{ variant: 'body1' }}
            secondaryTypographyProps={{ variant: 'body2' }}
          />
        </UserSection>

        <Divider />

        <MenuList>
          <MenuItem
            onClick={() => setTestnetMode(!testnetMode)}
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography>Testnet mode</Typography>
            <Switch
              checked={testnetMode}
              size="medium"
              onClick={(e) => e.stopPropagation()}
              onChange={(_, checked) => setTestnetMode(checked)}
            />
          </MenuItem>

          <MenuItem onClick={onClose}>
            <RemoveRedEye sx={{ mr: 1, fontSize: 20, opacity: 0.7 }} />
            <Typography>Watch wallet</Typography>
          </MenuItem>
        </MenuList>
      </MenuPaper>
    </StyledMenu>
  );
}
