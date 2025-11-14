import { useTheme } from '@mui/material';
import { Toaster } from 'sonner';

export const CowOrderToast = () => {
  const theme = useTheme();

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 6000,
        style: {
          background: `${theme.palette.background.paper}`,
          color: `${theme.palette.text.primary}`,
          border: `1px solid ${theme.palette.divider}`,
        },
      }}
    />
  );
};
