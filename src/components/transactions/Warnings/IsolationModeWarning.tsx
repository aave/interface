import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

// TODO: need text
export const IsolationModeWarning = () => {
  return (
    <Warning severity="warning">
      <Typography variant="subheader1" mb={0.5}>
        <Trans>Isolation mode warning</Trans>
      </Typography>
      <Typography>
        Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia
        consequat duis enim velit mollit.{' '}
        <Link href="https://docs.aave.com/faq/">
          FAQ <Trans>guide</Trans>
        </Link>
        .
      </Typography>
    </Warning>
  );
};
