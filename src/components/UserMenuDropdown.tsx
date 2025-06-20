import { useInfinexUser, useInfinexUserBalances } from '@infinex/connect-sdk';
import { Box, Button, Divider, Menu, MenuItem, Stack, Typography, useTheme } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import React, { MouseEvent, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';

import { AvatarSize } from './Avatar';
import { UserDisplay } from './UserDisplay';

const UserMenuDropdown: React.FC = () => {
  const theme = useTheme();
  const { data: user, refresh: refreshUser } = useInfinexUser();
  const chainId = useChainId();
  const { data: balances, refresh: refreshBalances } = useInfinexUserBalances();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const handleAvatarClick = (e: MouseEvent<HTMLElement>) => {
    setAnchor(e.currentTarget);
  };
  const handleClose = () => {
    setAnchor(null);
  };

  useEffect(() => {
    refreshUser();
    refreshBalances();
    // infinite loop with `refreshBalances` / `refreshUser`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

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
                  Available balance
                </Typography>
                <Typography variant="subheader1" fontSize="medium" color="lightgreen">
                  {balances?.chainBalanceNative.formatted ?? '0'} ETH
                </Typography>
              </Box>

              {user?.username && (
                <>
                  <Divider sx={{ pt: 2 }} />
                  <Stack spacing={4}>
                    <Box>
                      <Typography
                        variant="description"
                        color="textSecondary"
                        gutterBottom
                        fontSize="small"
                      >
                        Other balances
                      </Typography>
                      <Typography variant="subheader1" fontSize="medium">
                        {balances?.totalBalanceUsd.formatted ?? '0'} USD
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </Stack>
          </Menu>
        </>
      )}
    </ConnectKitButton.Custom>
  );
};

export default UserMenuDropdown;
