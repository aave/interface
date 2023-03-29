import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Warning } from '../../primitives/Warning';

export type ChangeNetworkWarningProps = {
  funnel?: string;
  networkName: string;
  chainId: ChainId;
};

export const ChangeNetworkWarning = ({
  networkName,
  chainId,
  funnel,
}: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleSwitchNetwork = () => {
    trackEvent(GENERAL.SWITCH_NETWORK, { funnel: funnel });
    switchNetwork(chainId);
  };
  return (
    <Warning severity="error" icon={false}>
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
        </Typography>
      )}
    </Warning>
  );
};
