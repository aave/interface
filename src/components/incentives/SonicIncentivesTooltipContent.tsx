import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

export const SonicAirdropTooltipContent = ({ points }: { points: number }) => {
  return (
    <Box>
      <Trans>{`This asset is eligible for ${(<b>{points}x</b>)} Sonic Rewards.\n`}</Trans>
      <br />
      <Trans>{'Learn more about Sonic Rewards program'}</Trans>{' '}
      <Link
        href="https://blog.soniclabs.com/sonic-points-simplified-how-to-qualify-for-200-million-s-airdrop/"
        sx={{ textDecoration: 'underline' }}
        variant="caption"
        color="text.secondary"
      >
        {'here'}
      </Link>
      {'.'}
      <br />
      <br />
      <Trans>
        {`Aave Labs does not
          guarantee the program and accepts no liability.\n`}
      </Trans>
    </Box>
  );
};
