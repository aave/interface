import { useInfinexUser } from '@infinex/connect-sdk';
import { Box, Button, Divider, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import React, { MouseEvent, useState } from 'react';

import { AvatarSize } from './Avatar';
import { UserDisplay } from './UserDisplay';

const UserMenuDropdown: React.FC = () => {
  const theme = useTheme();
  const { data: user } = useInfinexUser();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const handleAvatarClick = (e: MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <ConnectKitButton.Custom>
      {({ show }) => (
        <>
          <Button onClick={handleAvatarClick} variant="surface">
            <UserDisplay
              avatarProps={{ size: AvatarSize.SM }}
              oneLiner
              titleProps={{ variant: 'buttonM' }}
            />
          </Button>

          <Menu
            anchorEl={anchor}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                p: 4,
                minWidth: 200,
              },
            }}
            MenuListProps={{
              sx: { p: 0, m: 0 },
            }}
          >
            <Stack spacing={4}>
              <MenuItem
                disableGutters
                onClick={() => {
                  handleClose();
                  show?.();
                }}
                sx={{ px: 0, py: 0 }}
              >
                <Typography variant="buttonM">Profile</Typography>
              </MenuItem>
              <Divider sx={{ pt: 2 }} />
              <Box>
                <Typography
                  variant="description"
                  color="textSecondary"
                  gutterBottom
                  fontSize="small"
                >
                  Portfolio Balances
                </Typography>
                <Typography variant="subheader1" fontSize="medium" color="lightgreen">
                  {user?.totalBalance?.formatted || '0'} USD
                </Typography>
              </Box>
            </Stack>
          </Menu>
        </>
      )}
    </ConnectKitButton.Custom>
  );
};

export default UserMenuDropdown;
