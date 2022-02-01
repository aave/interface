import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography, Button } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { Warning } from '../primitives/Warning';

export type ChangeNetworkWarningProps = {
  networkName: string;
  chainId: ChainId;
};

export const ChangeNetworkWarning = ({ networkName, chainId }: ChangeNetworkWarningProps) => {
  const { switchNetwork } = useWeb3Context();
  return (
    <Warning>
      <Typography>
        <Trans>Please Switch to {networkName}.</Trans>
        <Button variant="text" sx={{ ml: '2px' }} onClick={() => switchNetwork(chainId)}>
          <Typography color="black">
            <Trans>Switch Network</Trans>
          </Typography>
        </Button>
      </Typography>
    </Warning>
  );
};
