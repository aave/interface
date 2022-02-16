import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Link } from '../../primitives/Link';
import { Warning } from '../../primitives/Warning';

// TODO: need text
export const SupplyCapWarning = () => {
  return (
    <Warning severity="warning" icon={false}>
      <Typography variant="subheader1" mb={0.5}>
        <Trans>Supply amount is limited due to Supply Cap</Trans>
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
