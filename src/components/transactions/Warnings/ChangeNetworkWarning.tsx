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
      <Typography>
        <Trans>Please switch to {networkName}.</Trans>{' '}
        <Button
          variant="text"
          sx={{ ml: '2px' }}
          onClick={() => switchNetwork(chainId)}
          disableRipple
        >
          <Trans>Switch Network</Trans>
        </Button>
      </Typography>
      {switchNetworkError && (
        <Typography>
          <Trans>Seems like we can't switch the network automatically. Please check if you can change it from the wallet.</Trans>
        </Typography>
      )}
    </Warning>
  );
};
