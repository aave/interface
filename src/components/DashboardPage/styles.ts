import { Box, styled } from '@mui/material';

export const FirstBlock = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 64,
}));

export const RightContainer = styled(Box)(() => ({
  display: 'flex',
  gap: 56,
  backgroundColor: '#FFFFFF14',
  border: `1px solid #FFFFFF4D`,
  borderRadius: 4,
  paddingBlock: 24,
  paddingInline: 40,
}));

export const HorizontalDivider = styled(Box)(({ theme }) => ({
  width: 1,
  height: '100%',
  backgroundColor: theme.palette.text.secondary,
}));

export const V3 = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: 100,
  paddingInline: 6,
}));
