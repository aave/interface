import {
  Box,
  Button as ButtonBase,
  Dialog as DialogBase,
  IconButton as IconButtonBase,
  styled,
  Typography,
} from '@mui/material';

export const Dialog = styled(DialogBase)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.text.primary,
    borderRadius: 4,
    padding: 24,
    minWidth: 360,
    backgroundImage: 'none',
  },
}));

export const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const CloseButton = styled(IconButtonBase)({
  position: 'absolute',
  right: 10,
  color: '#BDBDBD',
  padding: 4,
});

export const AvatarCircle = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(180deg, #80FF00 0%, #33691E 100%)',
  margin: '24px auto 16px',
});

export const AddressRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
});

export const CopyButton = styled(IconButtonBase)(({ theme }) => ({
  color: theme.palette.background.default,
  padding: 4,
}));

export const Balance = styled(Typography)({
  color: '#BDBDBD',
  textAlign: 'center',
  marginTop: 4,
});

export const DisconnectButton = styled(ButtonBase)({
  marginTop: 24,
  width: '100%',
});
