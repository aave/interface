import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

export const IgnitionAirdropTooltipContent = ({ points }: { points: number }) => {
  return (
    <Box>
      <Trans>{`This asset is eligible for ${(
        <b>{points}x</b>
      )} Ignition Sparkle campaign.\n`}</Trans>
      <br />
      <Trans>{'Learn more about Ignition Sparkle campaign'}</Trans>{' '}
      <Link
        href="https://fbtc.com/sparkle-campaign"
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
