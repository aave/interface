// import { Trans } from '@lingui/macro';
import { useTheme } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
// import { useWalletModalContext } from 'src/hooks/useWalletModal';
// import { useRootStore } from 'src/store/root';
// import { AUTH } from 'src/utils/mixPanelEvents';

// import { WalletModal } from './WalletModal';
// import { WatchWalletModal } from './WatchWalletModal';

export interface ConnectWalletProps {
  funnel?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({ funnel }) => {
  // TODO
  // const trackEvent = useRootStore((store) => store.trackEvent);
  console.log(funnel);

  const theme = useTheme();

  return (
    <>
      <ConnectKitButton
        customTheme={{
          '--ck-connectbutton-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-hover-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-active-background': theme.palette.gradients.aaveGradient,
          '--ck-connectbutton-border-radius': '4px',
          '--ck-connectbutton-font-size': '0.875rem',
        }}
      />
      {/* <Button
        variant="gradient"
        onClick={() => {
          trackEvent(AUTH.CONNECT_WALLET, { funnel: funnel });
          setWalletModalOpen(true);
        }}
      >
        <Trans>Connect wallet</Trans>
      </Button> */}
      {/* <WalletModal /> */}
      {/* <WatchWalletModal /> */}
    </>
  );
};
