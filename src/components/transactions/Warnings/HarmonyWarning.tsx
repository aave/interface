import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

export const HarmonyWarning = () => {
  return (
    <Warning severity="error">
      <Typography variant="caption">
        <Trans>
          Due to the Horizon bridge exploit, certain assets on the Harmony network are unbacked
          which affects the Aave V3 Harmony market.{' '}
          <Link
            href="https://governance.aave.com/t/harmony-horizon-bridge-exploit-consequences-to-aave-v3-harmony/8614"
            target="_blank"
          >
            Learn More
          </Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
