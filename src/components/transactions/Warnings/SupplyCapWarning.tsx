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
        <Trans>
          Supply caps limit the amount of a certain asset that can be supplied to the Aave protocol.
          This helps reducing exposure to the asset and mitigate attacks like infinite minting or
          price oracle manipulation.
        </Trans>
        <Link href="https://docs.aave.com/developers/whats-new/supply-borrow-caps">
          FAQ <Trans>guide</Trans>
        </Link>
        .
      </Typography>
    </Warning>
  );
};
