import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

export const FantomWarning = () => {
  return (
    <Warning severity="error">
      <Typography variant="caption">
        <Trans>
          Per the community, the fantom market has been disabled.
          <Link
            href="https://snapshot.org/#/aave.eth/proposal/0xeefcd76e523391a14cfd0a79b531ea0a3faf0eb4a058e255fac13a2d224cc647"
            target="_blank"
          >
            Learn More
          </Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
