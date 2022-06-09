import { Trans } from '@lingui/macro';
import { Typography, Button, useTheme } from '@mui/material';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { Warning } from '../primitives/Warning';
import { Link } from '../primitives/Link';

export type StakingWarningProps = {
  isWrongNetwork: boolean;
  isTestNet: boolean;
};

export const StakingWarning = ({ isWrongNetwork, isTestNet }: StakingWarningProps) => {
  const { switchNetwork } = useWeb3Context();
  const theme = useTheme();
  const bgDark = theme.palette.error[100];
  const colorDark = theme.palette.error[200];
  return (
    <Warning
      severity="error"
      sx={{ bgcolor: bgDark, color: colorDark, '.MuiAlert-message': { p: 0 }, mb: 0 }}
    >
      {isWrongNetwork && !isTestNet ? (
        <Typography variant="description">
          <Trans>Staking is only available on Ethereum.</Trans>{' '}
          <Button
            variant="text"
            sx={{ ml: '2px', verticalAlign: 'top' }}
            onClick={() => switchNetwork(1)}
            disableRipple
          >
            <Typography color={colorDark} variant="description">
              <Trans>Switch Network</Trans>
            </Typography>
          </Button>
        </Typography>
      ) : (
        <Typography variant="description">
          <Trans>
            Staking on test nets is only available on an Ethereum fork.
            <Link
              sx={{ color: `${colorDark}!important` }}
              href="https://github.com/sakulstra/tenderly-fork"
              fontWeight={500}
            >
              <Trans>Learn more</Trans>
            </Link>
          </Trans>
        </Typography>
      )}
    </Warning>
  );
};
