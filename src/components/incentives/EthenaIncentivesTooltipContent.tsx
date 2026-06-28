import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

export const EthenaAirdropTooltipContent = ({ points }: { points: number }) => {
  return (
    <Box>
      <Trans>{`This asset is eligible for ${(<b>{points}x</b>)} Ethena Rewards.\n`}</Trans>
      <br />
      <Trans>{'Learn more about Ethena Rewards program'}</Trans>{' '}
      <Link
        href="https://app.ethena.fi/join"
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
