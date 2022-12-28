import { useLingui } from '@lingui/react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import * as React from 'react';

import { Link } from '../../components/primitives/Link';
import { footerNavigation, footerSocial } from '../../ui-config/menu-items';

interface NavItemsProps {
  setOpen?: (value: boolean) => void;
}

export const FooterNavItems = ({ setOpen }: NavItemsProps) => {
  const { i18n } = useLingui();

  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { md: 'space-between', xs: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
        pt: { xs: 8 },
      }}
      //   display="flex"
      //   alignItems="center"
      //   justifyContent="space-between"
      //   width="100%"
    >
      <List
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-space', md: 'center' },
          flexDirection: { md: 'row' },
        }}
        disablePadding
      >
        {footerNavigation
          // .filter((item) => !item.isVisible || item.isVisible(currentMarketData))
          .map((item, index) => (
            <ListItem
              sx={{
                width: { xs: '100%', md: 'unset' },
                mr: { xs: 0, md: 2 },
              }}
              data-cy={item.dataCy}
              disablePadding
              key={index}
            >
              <Typography
                component={Link}
                href={item.link}
                variant="h2"
                color="#A5A8B6"
                sx={{ width: '100%', p: 4, pt: { sm: 2 }, fontSize: '12px' }}
                onClick={() => (setOpen ? setOpen(false) : undefined)}
              >
                {i18n._(item.title)}
              </Typography>
            </ListItem>
          ))}
      </List>
      <List>
        <ListItem sx={{ display: { md: 'flex' }, width: 'unset' }} disablePadding>
          {footerSocial.map((item, index) => {
            return (
              <ListItem
                sx={{
                  width: { xs: '100%', md: 'unset' },
                  mr: { xs: 0, md: 2 },
                  pr: { xs: 4, md: 2 },
                  pl: { xs: 4, md: 2 },
                  //   flexDirection: { xs: 'column' },
                }}
                data-cy={item.dataCy}
                disablePadding
                key={index}
              >
                {/* <Typography
                  component={Link}
                  href={item.link}
                  variant="h2"
                  color="#A5A8B6"
                  sx={{ width: '100%', p: 4, fontSize: '12px' }}
                  onClick={() => (setOpen ? setOpen(false) : undefined)}
                >
                  {i18n._(item.title)}
                </Typography> */}
                <ListItemIcon>
                  <SvgIcon sx={{ fontSize: '20px' }}>{item.icon}</SvgIcon>
                </ListItemIcon>
              </ListItem>
            );
          })}
        </ListItem>
      </List>
    </Box>
  );
};
