import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { HelpTourTooltip } from 'src/components/infoTooltips/HelpTourTooltip';
import { useHelpContext } from 'src/hooks/useHelp';

import { Link } from '../components/primitives/Link';
import { DrawerWrapper } from './components/DrawerWrapper';
import { MobileCloseButton } from './components/MobileCloseButton';

interface TourWidgetProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
}

export default function WalletWidget({ open, setOpen, headerHeight }: TourWidgetProps) {
  const { breakpoints } = useTheme();
  const { setTourInProgress, setClickAway, setPagination, withdrawTourActive } = useHelpContext();
  const md = useMediaQuery(breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const tours = [
    'Supply Tour',
    'Borrow Tour',
    'Withdrawal Tour',
    'Market Tour',
    'Token Detail Tour',
    'Stake Tour',
    'Governance Tour',
  ];

  const finishTours = ['Supply Tour', 'Withdrawal Tour'];

  const handlerClickTour = async (tour: string) => {
    setTourInProgress(tour);
    setClickAway(false);
    setOpen(false);
    localStorage.setItem(tour, 'false');
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setPagination(1);
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setOpen(false);

  const Content = ({ component = ListItem }: { component?: typeof MenuItem | typeof ListItem }) => (
    <>
      <Link href="https://docs.aave.com/faq/">
        <Box
          component={component}
          sx={{ fontWeight: 500, lineHeight: '16.94px', fontSize: '14px' }}
        >
          <ListItemText sx={{ color: { xs: '#F1F1F3', md: 'primary.light' } }}>FAQ</ListItemText>
        </Box>
      </Link>
      <Link href="https://discord.com/channels/602826299974877205/1020255268489138216">
        <Box
          component={component}
          sx={{ fontWeight: 500, lineHeight: '16.94px', fontSize: '14px' }}
        >
          <ListItemText sx={{ color: { xs: '#F1F1F3', md: 'primary.light' } }}>
            Discord Support
          </ListItemText>
        </Box>
      </Link>
      <Divider sx={{ my: { xs: 7, md: 0 }, borderColor: { xs: '#FFFFFF1F', md: 'divider' } }} />
      <Box
        sx={{
          fontWeight: 500,
          lineHeight: '16.94px',
          fontSize: '14px',
          ml: '18px',
          py: 2,
        }}
      >
        <ListItemText sx={{ color: '#A6A8B5', lineHeight: '16.94px', fontSize: '14px' }}>
          <Typography>AAVE Tours</Typography>
        </ListItemText>
      </Box>
      {tours.map((tour, index) => {
        return (
          <Box component={component} key={index}>
            {!finishTours.find((elm) => elm === tour) ? (
              !md ? (
                <HelpTourTooltip
                  tooltipContent={
                    <Box>
                      <Typography>Our team is working in </Typography>
                      <Typography>{tour}, stay tunned.</Typography>
                    </Box>
                  }
                  tour={
                    <ListItemText
                      sx={{ color: { xs: '#F1F1F3', md: 'primary.light' }, fontWeight: 500 }}
                    >
                      <Box sx={{ fontWeight: 600 }}>{tour}</Box>
                      {!finishTours.find((elm) => elm === tour) && (
                        <Typography sx={{ color: { xs: '#F1F1F3', md: 'primary.light' } }}>
                          Coming soon
                        </Typography>
                      )}
                    </ListItemText>
                  }
                />
              ) : (
                <ListItemText sx={{ color: { xs: '#F1F1F3', md: 'primary.light' } }}>
                  <Box sx={{ fontWeight: 600 }}>{tour}</Box>
                  <Typography sx={{ color: 'rgba(241, 241, 243, 0.35)' }}>Coming soon</Typography>
                </ListItemText>
              )
            ) : (
              <ListItemText
                onClick={() => handlerClickTour(tour)}
                sx={{ color: { xs: '#F1F1F3', md: 'primary.light' } }}
              >
                {withdrawTourActive === 0 && tour === 'Withdrawal Tour' ? (
                  <HelpTourTooltip
                    tooltipContent={
                      <Box>
                        <Typography>Available when you supply to the protocol</Typography>
                      </Box>
                    }
                    tour={
                      <ListItemText
                        sx={{ color: { xs: '#F1F1F3', md: 'primary.light' }, fontWeight: 600 }}
                      >
                        {tour}
                      </ListItemText>
                    }
                  />
                ) : (
                  <Box sx={{ fontWeight: 600 }}>{tour}</Box>
                )}
              </ListItemText>
            )}
          </Box>
        );
      })}
    </>
  );

  return (
    <>
      {md && open ? (
        <MobileCloseButton setOpen={setOpen} />
      ) : (
        <Button
          aria-label="tour"
          id="tour-button"
          aria-controls={open ? 'tour-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{ p: '7px 8px', minWidth: 'unset', mr: 2, borderRadius: '50%', bgcolor: '#393D4F' }}
        >
          <SvgIcon sx={{ color: '#F1F1F3' }} fontSize="small">
            <QuestionMarkIcon />
          </SvgIcon>
        </Button>
      )}

      {md ? (
        <DrawerWrapper open={open} setOpen={setOpen} headerHeight={headerHeight}>
          <List sx={{ px: 2, '.MuiListItem-root.Mui-disabled': { opacity: 1 } }}>
            <Content />
          </List>
        </DrawerWrapper>
      ) : (
        <Menu
          id="tour-menu"
          MenuListProps={{
            'aria-labelledby': 'tour-button',
          }}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          keepMounted={true}
        >
          <MenuList disablePadding sx={{ '.MuiMenuItem-root.Mui-disabled': { opacity: 1 } }}>
            <Content component={MenuItem} />
          </MenuList>
        </Menu>
      )}
    </>
  );
}
