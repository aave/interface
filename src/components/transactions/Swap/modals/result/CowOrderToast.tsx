import { Toaster } from 'sonner';
import { figVars } from 'src/utils/figmaColors';

export const CowOrderToast = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 6000,
        style: {
          background: `${figVars['surface-elevated']}`,
          color: `${figVars['fg-1']}`,
          border: `1px solid ${figVars['border-2']}`,
        },
      }}
    />
  );
};
