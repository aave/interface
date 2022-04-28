import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Warning } from '../../primitives/Warning';

export type ChangeNetworkWarningProps = {
  networkName: string;
  chainId: ChainId;
};

export const ChangeNetworkWarning = ({ networkName, chainId }: ChangeNetworkWarningProps) => {
  const { switchNetwork, switchNetworkError } = useWeb3Context();

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
            onClick={() => switchNetwork(chainId)}
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
