import { Box, styled } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.default,
  paddingBlock: 24,
}));

export const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-end',
  },
}));

export const LinksWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 16,

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));
