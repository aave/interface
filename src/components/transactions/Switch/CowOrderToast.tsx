import { Toaster } from 'sonner';

export const CowOrderToast = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 6000,
        style: {
          background: 'var(--mui-palette-background-paper)',
          color: 'var(--mui-palette-text-primary)',
          border: '1px solid var(--mui-palette-divider)',
        },
      }}
    />
  );
};
