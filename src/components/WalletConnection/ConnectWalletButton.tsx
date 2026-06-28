import { Identify, identify, setUserId } from '@amplitude/analytics-browser';
import { Trans } from '@lingui/macro';
import { Button } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useRef, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { AUTH } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { AvatarSize } from '../Avatar';
import { UserDisplay } from '../UserDisplay';

export interface ConnectWalletProps {
  funnel?: string;
  onIsConnecting?: (isConnecting: boolean) => void;
  onClick?: () => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletProps> = ({ funnel, onClick }) => {
  const [trackEvent, walletType, account] = useRootStore(
    useShallow((store) => [store.trackEvent, store.walletType, store.account])
  );

  // Track connection attempt duration
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  const previousConnectionState = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false);
  const isConnectedRef = useRef<boolean>(false);

  const connectionAttempts = useRef<number>(0);

  // Track connection state changes
  useEffect(() => {
    if (isConnectingRef.current && !previousConnectionState.current) {
      // Connection attempt started
      setConnectionStartTime(Date.now());
      connectionAttempts.current += 1;
      trackEvent(AUTH.WALLET_CONNECT_START, {
        funnel,
        attempt_number: connectionAttempts.current,
        previous_wallet_type: walletType,
      });
    }

    if (!isConnectingRef.current && previousConnectionState.current) {
      // Connection attempt ended
      const duration = connectionStartTime ? Date.now() - connectionStartTime : 0;

      const walletAddress = account;
      if (walletAddress) {
        setUserId(walletAddress);

        const identifyObj = new Identify()
          .set('wallet_connected', true)
          .set('wallet_type', walletType || 'unknown');

        identify(identifyObj);
      }

      if (isConnectedRef.current) {
        trackEvent(AUTH.WALLET_CONNECT_SUCCESS, {
          funnel,
          wallet_type: walletType,
          connection_duration_ms: duration,
          attempts_until_success: connectionAttempts.current,
        });
      } else {
        trackEvent(AUTH.WALLET_CONNECT_ABORT, {
          funnel,
          connection_duration_ms: duration,
          attempt_number: connectionAttempts.current,
        });
      }
      setConnectionStartTime(null);
    }

    previousConnectionState.current = isConnectingRef.current;
  }, [connectionStartTime, funnel, trackEvent, walletType, account]);

  useEffect(() => {
    if (!account && walletType === undefined) {
      // Wallet disconnected - clear identity
      const identifyObj = new Identify().set('wallet_connected', false).unset('wallet_type');

      identify(identifyObj);

      trackEvent(AUTH.DISCONNECT_WALLET, {
        funnel,
      });
    }
  }, [account, walletType, funnel, trackEvent]);

  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show, isConnecting }) => {
          // Update refs for tracking
          isConnectingRef.current = isConnecting;
          isConnectedRef.current = isConnected;

          return (
            <Button
              variant={isConnected ? 'surface' : 'gradient'}
              onClick={() => {
                // Track initial button click
                trackEvent(AUTH.CONNECT_WALLET, {
                  funnel,
                  current_url: window.location.pathname,
                  is_reconnect_attempt: connectionAttempts.current > 0,
                });

                onClick && onClick();
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
