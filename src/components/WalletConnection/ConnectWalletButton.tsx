// import { Trans } from '@lingui/macro';
import { Trans } from '@lingui/macro';
import { Button, ButtonProps } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useRootStore } from 'src/store/root';
import { AUTH } from 'src/utils/mixPanelEvents';

import { AvatarSize } from '../Avatar';
import { UserDisplay } from '../UserDisplay';

export interface ConnectWalletProps {
  funnel?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, show: () => void) => void;
  buttonProps?: ButtonProps;
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({
  funnel,
  onClick,
  buttonProps,
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    show: (() => void) | undefined
  ) => {
    if (!show) return;

    trackEvent(AUTH.CONNECT_WALLET, { funnel });
    if (onClick) {
      onClick(event, show);
    } else {
      show();
    }
  };

  return (
    <ConnectKitButton.Custom>
      {({ show, isConnected }) => (
        <Button
          onClick={(event) => handleClick(event, show)}
          variant={isConnected ? 'surface' : 'gradient'}
          sx={{
            p: isConnected ? '5px 8px' : undefined,
          }}
          {...buttonProps}
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
      )}
    </ConnectKitButton.Custom>
  );
};
