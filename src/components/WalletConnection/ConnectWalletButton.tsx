import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useRootStore } from 'src/store/root';
import { AUTH } from 'src/utils/mixPanelEvents';

import { AvatarSize } from '../Avatar';
import { UserDisplay } from '../UserDisplay';

export interface ConnectWalletProps {
  funnel?: string;
  onIsConnecting?: (isConnecting: boolean) => void;
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
                trackEvent(AUTH.CONNECT_WALLET, { funnel: funnel });
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
