import { Box, styled } from '@mui/material';

export const FirstBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  marginTop: 64,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    marginTop: 40,
  },
}));

export const RightContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  gap: 56,
  backgroundColor: '#FFFFFF14',
  border: `1px solid #FFFFFF4D`,
  borderRadius: 4,
  paddingBlock: 24,
  paddingInline: 40,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 24,
    paddingInline: 24,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
}));

export const HorizontalDivider = styled(Box)(({ theme }) => ({
  width: 1,
  minHeight: 48,
  backgroundColor: theme.palette.text.secondary,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    minHeight: 1,
    height: 1,
  },
}));

export const V3 = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: 100,
  paddingInline: 6,
}));

export const LeftContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 24,
}));

export const TitleContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}));

export const TitleRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}));

export const StatBlock = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}));

export const RewardsRow = styled(Box)(() => ({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
}));

export const CardsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 24,
  marginTop: 32,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const TablesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 24,
  marginTop: 32,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const TableSwitchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  backgroundColor: '#0b0b0b',
  border: '1px solid #FFFFFF4D',
  borderRadius: 4,
  marginTop: 16,
  gap: 4,
  padding: 3,

  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));
