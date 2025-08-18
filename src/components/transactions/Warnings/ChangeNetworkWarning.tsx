import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { AlertProps, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TrackEventProps } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { Warning } from '../../primitives/Warning';

export type ChangeNetworkWarningProps = AlertProps & {
  funnel?: string;
  networkName: string;
  chainId: ChainId;
  event?: TrackEventProps;
  askManualSwitch?: boolean;
  autoSwitchOnMount?: boolean; // New prop to control auto-switching
};

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  event,
  funnel,
  askManualSwitch = false,
  autoSwitchOnMount = true, // Default to true for better UX
  ...rest
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  // State to track auto-switch attempt
  const [isAutoSwitching, setIsAutoSwitching] = useState(false);
  const [hasAttemptedAutoSwitch, setHasAttemptedAutoSwitch] = useState(false);

  // Auto-attempt network switch on mount
  useEffect(() => {
    if (autoSwitchOnMount && !hasAttemptedAutoSwitch) {
      setHasAttemptedAutoSwitch(true);
      setIsAutoSwitching(true);

      // Track the automatic attempt
      trackEvent(GENERAL.SWITCH_NETWORK, {
        funnel,
        ...event?.eventParams,
        network: networkName,
        automatic: true,
      });

      // Attempt switch and handle completion
      switchNetwork(chainId).finally(() => {
        setIsAutoSwitching(false);
      });
    }
  }, [
    autoSwitchOnMount,
    hasAttemptedAutoSwitch,
    chainId,
    switchNetwork,
    trackEvent,
    funnel,
    event,
    networkName,
  ]);

  const handleManualSwitchNetwork = () => {
    trackEvent(GENERAL.SWITCH_NETWORK, {
      funnel,
      ...event?.eventParams,
      network: networkName,
      manual: true,
    });
    switchNetwork(chainId);
  };
  return (
    <Warning severity="error" icon={false} {...rest}>
      {isAutoSwitching ? (
        // Show loading state during auto-switch attempt
        <Typography variant="description" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Trans>Switching to {networkName}...</Trans>
        </Typography>
      ) : switchNetworkError ? (
        // Show error message if switch failed
        <Typography>
          <Trans>
            {hasAttemptedAutoSwitch
              ? "We couldn't switch the network automatically. Please check if you can change it from the wallet."
              : "Seems like we can't switch the network automatically. Please check if you can change it from the wallet."}
          </Trans>
        </Typography>
      ) : (
        // Show manual switch option
        <Typography variant="description">
          <Trans>
            {hasAttemptedAutoSwitch
              ? `Auto-switch failed. Please manually switch to ${networkName}.`
              : `Please switch to ${networkName}.`}
          </Trans>{' '}
          {!askManualSwitch && (
            <Button
              variant="text"
              sx={{ ml: '2px', verticalAlign: 'top' }}
              onClick={handleManualSwitchNetwork}
              disableRipple
            >
              <Typography variant="description">
                <Trans>Switch Network</Trans>
              </Typography>
            </Button>
          )}
        </Typography>
      )}
    </Warning>
  );
};
