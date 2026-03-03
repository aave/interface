import { Box, Dialog as DialogBase, styled, Tabs } from '@mui/material';

export const Dialog = styled(DialogBase)({
  '& .MuiPaper-root': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    backgroundImage: 'none',
    overflow: 'visible',
  },
});

export const ModalCard = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(200px)',
  borderRadius: 4,
  padding: '16px 24px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 420,
});

export const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const TabsFullWidth = styled(Tabs)({
  minHeight: 36,
  '& .MuiTab-root': {
    flex: 1,
    minHeight: 36,
    textTransform: 'lowercase',
  },
});

export const SlippageRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const TokenInputRow = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  padding: '12px 16px',
  backgroundColor: theme.palette.background.paper,
}));

export const AmountInput = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const AmountDisplay = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

export const TokenInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 2,
});

export const BalanceRow = styled(Box)({
  display: 'flex',
  gap: 4,
  alignItems: 'center',
});

export const SwapToSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const OverviewSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const OverviewRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
}));
