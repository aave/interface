import { Box, styled } from '@mui/material';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: 64,
  marginBottom: 64,
  display: 'flex',
  flexDirection: 'column',
  gap: 64,
  [theme.breakpoints.down('md')]: {
    marginTop: 56,
    marginBottom: 56,
    gap: 56,
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: 48,
    marginBottom: 48,
    gap: 48,
  },
}));

export const Content = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
});

export const Divider = styled(Box)({
  height: 14,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
});

export const Sections = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 56,
}));

export const Section = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
});

export const Rows = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const Row = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded?: boolean }>(({ expanded }) => ({
  borderRadius: 4,
  border: expanded ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
  backgroundColor: '#FFFFFF0D',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}));

export const RowHead = styled(Box)({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
});

export const IconBox = styled(Box)(({ theme }) => ({
  width: 42,
  height: 42,
  flexShrink: 0,
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  transition: 'background-color .2s ease',
  '&:hover': {
    backgroundColor: '#FFFFFF0F',
  },
}));

export const Answer = styled(Box)(({ theme }) => ({
  maxWidth: 656,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));
