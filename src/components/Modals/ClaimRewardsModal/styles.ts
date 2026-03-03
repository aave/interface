import { Box, Dialog as DialogBase, styled } from '@mui/material';

export const Dialog = styled(DialogBase)({
  '& .MuiPaper-root': {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    minWidth: 444,
    backgroundImage: 'none',
    boxShadow:
      '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
  },
});

export const Header = styled(Box)({
  padding: '16px 24px',
});

export const Content = styled(Box)({
  padding: '8px 24px 16px',
});

export const Actions = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '8px 16px',
});
