import { Box, IconButton as IconButtonBase, styled, Tabs as TabsBase } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  paddingBlock: 16,
  borderBottomColor: `${theme.palette.primary.main}4D`,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
}));

export const Tabs = styled(TabsBase)({
  overflow: 'visible',

  '&& .MuiTabs-scroller.MuiTabs-scroller': {
    overflow: 'visible !important',
  },

  '& .MuiTabs-indicator': {
    bottom: -17,
  },
});

export const IconButton = styled(IconButtonBase)({
  backgroundColor: '#FFFFFF1F',
  borderColor: '#FFFFFF4D',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 4,
  color: '#FFF',
});
