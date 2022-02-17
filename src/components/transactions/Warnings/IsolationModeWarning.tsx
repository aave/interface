import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

// TODO: need text
export const IsolationModeWarning = () => {
  return (
    <Warning severity="warning">
      <Typography variant="subheader1" mb={0.5}>
        <Trans>You are entering Isolation mode</Trans>
      </Typography>
      <Typography>
        <Trans>
          In Isolation mode you cannot supply other assets as collateral for borrowing. You can only
          borrow up to a specific debt ceiling. Read more in our
          <Link href="https://docs.aave.com/faq/">FAQ</Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
