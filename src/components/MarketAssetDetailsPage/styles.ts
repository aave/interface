import { Box, Paper as PaperBase, styled } from '@mui/material';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: 64,
  paddingInline: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  [theme.breakpoints.down('md')]: {
    marginTop: 32,
  },
  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    paddingInline: 16,
    paddingBottom: 24,
    gap: 16,
  },
}));

export const TopRows = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  [theme.breakpoints.up('sm')]: {
    gap: 24,
  },
}));

export const InstanceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  [theme.breakpoints.down('xsm')]: {
    gap: 8,
  },
}));

export const AssetTitleRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
});

export const AssetIdentity = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const V3Badge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.dark,
  borderRadius: 100,
  paddingInline: 8,
  paddingBlock: 2,
}));

export const StatsStrip = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  flexWrap: 'nowrap',
  gap: 0,
  paddingBlock: 16,
  paddingInline: 12,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : theme.palette.grey[100],
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  [theme.breakpoints.up('sm')]: {
    paddingInline: 20,
  },
  [theme.breakpoints.up('md')]: {
    paddingInline: 24,
  },
}));

export const StatCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  paddingInline: 12,
  flex: '1 1 auto',
  minWidth: 120,
  [theme.breakpoints.up('sm')]: {
    paddingInline: 16,
  },
  [theme.breakpoints.up('md')]: {
    paddingInline: 20,
  },
}));

export const StatDivider = styled(Box)(({ theme }) => ({
  width: 1,
  alignSelf: 'stretch',
  minHeight: 40,
  backgroundColor: theme.palette.divider,
  flexShrink: 0,
}));

export const OracleActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
});

export const SectionShell = styled(PaperBase)(({ theme }) => ({
  marginTop: 8,
  padding: 16,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    padding: 20,
  },
  [theme.breakpoints.up('md')]: {
    padding: 24,
    gap: 24,
  },
}));

export const SectionTitle = styled(Box)({
  marginBottom: 4,
});

export const ConfigCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  padding: 16,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  [theme.breakpoints.up('sm')]: {
    padding: 20,
  },
}));

export const CardBlockTitle = styled(Box)({});

export const SupplyBorrowMain = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

export const DonutBlock = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  flexShrink: 0,
});

export const DonutRing = styled(Box, {
  shouldForwardProp: (p) => p !== 'pct' && p !== 'accent',
})<{ pct: number; accent: string }>(({ pct, accent, theme }) => ({
  width: 88,
  height: 88,
  borderRadius: '50%',
  background: `conic-gradient(${accent} ${pct * 3.6}deg, ${theme.palette.divider} 0deg)`,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
}));

export const DonutInner = styled(Box)(({ theme }) => ({
  width: 68,
  height: 68,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const MetricsRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
  flex: 1,
  alignItems: 'flex-start',
});

export const MetricCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 100,
});

export const MetricDivider = styled(Box)(({ theme }) => ({
  width: 1,
  alignSelf: 'stretch',
  minHeight: 48,
  backgroundColor: theme.palette.divider,
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
}));

export const ChartBlock = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const ChartToolbar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
});

export const ChartTag = styled(Box)(({ theme }) => ({
  paddingInline: 8,
  paddingBlock: 4,
  borderRadius: 3,
  backgroundColor: theme.palette.action.hover,
}));

export const ChartPlaceholder = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 140,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.01) 100%)',
  overflow: 'hidden',
}));

export const ChartAvgPill = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 12,
  left: 12,
  paddingInline: 10,
  paddingBlock: 6,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

export const Subsection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const FlagRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
});

export const FlagItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const ParamRows = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const ParamRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 12,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : theme.palette.grey[50],
}));

export const EmodeStack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
});

export const EmodeCategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  paddingBottom: 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-of-type': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}));
