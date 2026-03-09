import { Box, IconButton as IconButtonBase, styled, Tabs as TabsBase } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingBlock: 16,
  borderBottomColor: `${theme.palette.primary.main}4D`,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
}));

export const Tabs = styled(TabsBase)(({ theme }) => ({
  overflow: 'visible',

  '&& .MuiTabs-scroller.MuiTabs-scroller': {
    overflow: 'visible !important',
  },

  '& .MuiTabs-indicator': {
    bottom: -17,
  },

  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const TabsWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const MobileMenuButton = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'block',
  },
}));

export const IconButton = styled(IconButtonBase)({
  backgroundColor: '#FFFFFF1F',
  borderColor: '#FFFFFF4D',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 4,
  color: '#FFF',
});
