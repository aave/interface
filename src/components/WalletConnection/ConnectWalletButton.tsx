// import { Trans } from '@lingui/macro';
import { useTheme } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useRootStore } from 'src/store/root';
import { AUTH } from 'src/utils/mixPanelEvents';

export interface ConnectWalletProps {
  funnel?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({ funnel }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const theme = useTheme();

  const onClick = (open: () => void) => {
    trackEvent(AUTH.CONNECT_WALLET, { funnel });
    open();
  };

  return (
    <>
      <ConnectKitButton
        onClick={onClick}
        customTheme={{
          '--ck-connectbutton-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-hover-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-active-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-border-radius': '4px',
          '--ck-connectbutton-font-size': '0.875rem',
        }}
      />
    </>
  );
};
