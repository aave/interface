import { useLingui } from '@lingui/react';
import { Button, List, ListItem, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { Link } from '../../components/primitives/Link';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { navigation } from '../../ui-config/menu-items';
import { MoreMenu } from '../MoreMenu';

interface NavItemsProps {
  setOpen?: (value: boolean) => void;
}

export const NavItems = ({ setOpen }: NavItemsProps) => {
  const { i18n } = useLingui();
  const { currentMarketData } = useProtocolDataContext();

  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));

  return (
    <List
      sx={{
        display: 'flex',
        alignItems: { xxs: 'flex-start', md: 'center' },
        flexDirection: { xxs: 'column', md: 'row' },
      }}
      disablePadding
    >
      {navigation.map((item, index) => (
        <ListItem
          sx={{
            display:
              !!item.isVisible && !item.isVisible(currentMarketData) ? 'none' : 'inline-flex',
            width: { xxs: '100%', md: 'unset' },
            mr: { xxs: 0, md: 2 },
          }}
          data-cy={item.dataCy}
          disablePadding
          key={index}
        >
          {md ? (
            <Typography
              component={Link}
              href={item.link}
              variant="h2"
              color="common.white"
              sx={{ width: '100%', p: 4 }}
              onClick={() => (setOpen ? setOpen(false) : undefined)}
            >
              {i18n._(item.title)}
            </Typography>
          ) : (
            <Button
              component={Link}
              href={item.link}
              sx={{
                color: 'common.white',
                p: '6px 8px',
                '&:hover': {
                  bgcolor: 'rgba(250, 251, 252, 0.08)',
                },
              }}
            >
              {i18n._(item.title)}
            </Button>
          )}
        </ListItem>
      ))}

      <ListItem sx={{ display: { xxs: 'none', md: 'flex' }, width: 'unset' }} disablePadding>
        <MoreMenu />
      </ListItem>
    </List>
  );
};
