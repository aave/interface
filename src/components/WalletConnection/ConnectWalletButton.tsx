import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useWalletModalContext } from 'src/hooks/useWalletModal';
import { useRootStore } from 'src/store/root';
import { AUTH } from 'src/utils/mixPanelEvents';

import { AvatarSize } from '../Avatar';
import { UserDisplay } from '../UserDisplay';

export interface ConnectWalletProps {
  funnel?: string;
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({ funnel }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show }) => {
          return (
            <Button
              variant={isConnected ? 'surface' : 'gradient'}
              onClick={() => {
                show && show();
              }}
            >
              {isConnected ? (
                <UserDisplay
                  avatarProps={{ size: AvatarSize.SM }}
                  oneLiner={true}
                  titleProps={{ variant: 'buttonM' }}
                />
              ) : (
                <Trans>Connect wallet</Trans>
              )}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
};
