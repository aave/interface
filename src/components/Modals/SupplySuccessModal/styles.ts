import { Box, Dialog as DialogBase, styled } from '@mui/material';

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
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  width: 500,
});

export const CheckCircle = styled(Box)({
  width: 100,
  height: 100,
  borderRadius: '50%',
  backgroundColor: 'rgba(128, 255, 0, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const TitleSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
});

export const AddToWalletRow = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  width: '100%',
  padding: '8px 16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
});

export const ButtonsColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const ViewDetailsButton = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
});
