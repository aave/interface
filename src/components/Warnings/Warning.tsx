import { Trans } from '@lingui/macro';
import { Typography, Button } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Warning } from '../primitives/Warning';
import { Link } from '../primitives/Link';

export type StakingWarningProps = {
  isWrongNetwork: boolean;
  isTestNet: boolean;
};

export const StakingWarning = ({ isWrongNetwork, isTestNet }: StakingWarningProps) => {
  const { switchNetwork } = useWeb3Context();

  return (
    <Warning severity="error" sx={{ '.MuiAlert-message': { p: 0 }, mb: 0 }}>
      {isWrongNetwork && !isTestNet ? (
        <Typography variant="description">
          <Trans>Staking is only available on Ethereum.</Trans>{' '}
          <Button
            variant="text"
            sx={{ ml: '2px', verticalAlign: 'top' }}
            onClick={() => switchNetwork(1)}
            disableRipple
          >
            <Typography variant="description">
              <Trans>Switch Network</Trans>
            </Typography>
          </Button>
        </Typography>
      ) : (
        <Typography variant="caption">
          <Trans>
            Staking on test nets is only available on an Ethereum fork.
            <Link href="https://github.com/sakulstra/tenderly-fork" fontWeight={500}>
              <Trans>Learn more</Trans>
            </Link>
          </Trans>
        </Typography>
      )}
    </Warning>
  );
};
