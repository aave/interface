import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Alert, AlertProps, Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TrackEventProps } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

export type ChangeNetworkWarningProps = AlertProps & {
  funnel?: string;
  networkName: string;
  chainId: ChainId;
  event?: TrackEventProps;
  askManualSwitch?: boolean;
  autoSwitchOnMount?: boolean;
};

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  event,
  funnel,
  askManualSwitch = false,
  autoSwitchOnMount = true,
  sx,
  ...rest
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const [isAutoSwitching, setIsAutoSwitching] = useState(false);
  const [hasAttemptedAutoSwitch, setHasAttemptedAutoSwitch] = useState(false);

  useEffect(() => {
    if (autoSwitchOnMount && !hasAttemptedAutoSwitch && !isAutoSwitching) {
      setHasAttemptedAutoSwitch(true);
      setIsAutoSwitching(true);

      trackEvent(GENERAL.SWITCH_NETWORK, {
        funnel,
        ...event?.eventParams,
        network: networkName,
      });

      switchNetwork(chainId).finally(() => {
        setIsAutoSwitching(false);
        setHasAttemptedAutoSwitch(true);
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
      manual: false,
    });
    switchNetwork(chainId);
  };
  return (
    <Alert
      severity={!isAutoSwitching && switchNetworkError ? 'error' : 'info'}
      data-size="small"
      {...rest}
      sx={[{ mb: 6, width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {isAutoSwitching ? (
        <>
          <CircularProgress size={16} />
          <Trans>Switching to {networkName}...</Trans>
        </>
      ) : switchNetworkError ? (
        <Trans>
          {hasAttemptedAutoSwitch
            ? "We couldn't switch the network automatically. Please check if you can change it from the wallet."
            : "Seems like we can't switch the network automatically. Please check if you can change it from the wallet."}
        </Trans>
      ) : (
        // Show manual switch option
        <>
          <Trans>
            {hasAttemptedAutoSwitch
              ? `Auto-switch failed. Please manually switch to ${networkName}.`
              : `Please switch to ${networkName}.`}
          </Trans>{' '}
          {!askManualSwitch && (
            <Button variant="text" onClick={handleManualSwitchNetwork} disableRipple>
              <Trans>Switch Network</Trans>
            </Button>
          )}
        </>
      )}
    </Alert>
  );
};
