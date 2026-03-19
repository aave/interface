import { Box, Paper as PaperBase, styled } from '@mui/material';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: 64,
  paddingInline: 0,
  [theme.breakpoints.down('md')]: {
    marginTop: 32,
  },
  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    paddingInline: 16,
    paddingBottom: 16,
    gap: 48,
  },
}));

export const Title = styled(Box)(({ theme }) => ({
  marginBottom: 24,
  [theme.breakpoints.down('xsm')]: {
    marginBottom: 16,
  },
}));

export const BannerRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBlock: 16,
  paddingInline: 24,
  backgroundColor: theme.palette.background.surface,
  borderRadius: 4,
  marginBottom: 24,
  flexWrap: 'wrap',
  gap: 16,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBlock: 12,
    paddingInline: 16,
    marginBottom: 16,
  },
  [theme.breakpoints.down('xsm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingBlock: 12,
    paddingInline: 16,
    marginBottom: 24,
  },
}));

export const CoreInstanceBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  marginBottom: 24,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  [theme.breakpoints.down('xsm')]: {
    gap: 16,
    marginBottom: 24,
  },
}));

export const CoreInstanceInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const StatsCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 24,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: 4,
  paddingBlock: 24,
  paddingInline: 40,
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    gap: 16,
    paddingBlock: 16,
    paddingInline: 20,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    gap: 16,
    paddingBlock: 16,
    paddingInline: 16,
  },
  [theme.breakpoints.down('xsm')]: {
    flexDirection: 'row',
    gap: 16,
    paddingBlock: 16,
    paddingInline: 16,
  },
}));

export const StatItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const VerticalDivider = styled(Box)(({ theme }) => ({
  width: 1,
  minHeight: 40,
  backgroundColor: theme.palette.text.secondary,
  [theme.breakpoints.down('sm')]: {
    width: 1,
    minHeight: 32,
  },
  [theme.breakpoints.down('xsm')]: {
    width: 1,
    minHeight: 32,
  },
}));

export const CoreAssetsSection = styled(PaperBase)(({ theme }) => ({
  marginTop: 24,
  padding: 24,
  border: '1px solid #FFFFFF4D',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,

  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    gap: 16,
  },
}));

export const FiltersRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
  [theme.breakpoints.down('xsm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

export const TablePaper = styled(PaperBase)(({ theme }) => ({
  borderRadius: 4,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down('md')]: {
    overflowX: 'auto',
  },
  [theme.breakpoints.down('xsm')]: {
    border: 'none',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
}));

export const MobileAssetCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 16,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: 4,
  backgroundColor: theme.palette.background.paper,
}));

export const DesktopTable = styled(Box)(({ theme }) => ({
  display: 'block',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const MobileCards = styled(Box)(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  gap: 12,
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
}));

export const V3Badge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.dark,
  borderRadius: 100,
  paddingInline: 8,
  paddingBlock: 2,
}));
