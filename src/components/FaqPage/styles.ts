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

export const Body = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 64,
  },
}));

export const NavAside = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1,
  marginInline: -16,
  paddingInline: 16,
  paddingBottom: 16,
  marginBottom: -8,
  background: theme.palette.background.default,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  [theme.breakpoints.up('md')]: {
    top: 24,
    flexShrink: 0,
    width: 200,
    marginInline: 0,
    paddingInline: 0,
    paddingBottom: 0,
    marginBottom: 0,
    borderBottom: 'none',
    alignSelf: 'flex-start',
  },
}));

export const NavList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  gap: 20,
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.up('md')]: {
    flexDirection: 'column',
    gap: 16,
    overflowX: 'visible',
  },
}));

export const NavLink = styled('a', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  flexShrink: 0,
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: theme.typography.fontFamily,
  fontSize: 14,
  lineHeight: 1.35,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontWeight: active ? 500 : 400,
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  transition: 'color 0.2s ease',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'normal',
  },
  '&:hover': {
    color: active ? theme.palette.primary.main : theme.palette.text.primary,
  },
}));

export const Content = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  flex: 1,
  minWidth: 0,
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

export const Section = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  scrollMarginTop: 24,
  [theme.breakpoints.up('md')]: {
    scrollMarginTop: 32,
  },
}));

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
