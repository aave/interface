import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { AlertProps, Button, Typography } from '@mui/material';
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
};

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  event,
  funnel,
  askManualSwitch = false,
  ...rest
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleSwitchNetwork = () => {
    trackEvent(GENERAL.SWITCH_NETWORK, { funnel, ...event?.eventParams, network: networkName });
    switchNetwork(chainId);
  };
  return (
    <Warning severity="error" icon={false} {...rest}>
      {switchNetworkError ? (
        <Typography>
          <Trans>
            Seems like we can&apos;t switch the network automatically. Please check if you can
            change it from the wallet.
          </Trans>
        </Typography>
      ) : (
        <Typography variant="description">
          <Trans>Please switch to {networkName}.</Trans>{' '}
          {!askManualSwitch && (
            <Button
              variant="text"
              sx={{ ml: '2px', verticalAlign: 'top' }}
              onClick={handleSwitchNetwork}
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
