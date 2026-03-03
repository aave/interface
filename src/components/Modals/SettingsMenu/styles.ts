import { Box, Menu, styled } from '@mui/material';

export const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    backgroundColor: '#2E2E2E',
    borderRadius: 4,
    minWidth: 220,
    boxShadow:
      '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
    backgroundImage: 'none',
  },
  '& .MuiList-root': {
    padding: 0,
  },
});

export const MenuPaper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const UserSection = styled(Box)({
  padding: '12px 16px',
});
