import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

export const EtherFiAirdropTooltipContent = ({ multiplier }: { multiplier: number }) => {
  return (
    <Box>
      <Trans>
        {`This asset is eligible for the Ether.fi Loyalty program with a `}
        <b>x{multiplier} multiplier</b>
        {`.`}
      </Trans>
      <br />
      <Trans>Learn more about the Ether.fi program</Trans>{' '}
      <Link
        href="https://etherfi.gitbook.io/etherfi/getting-started/loyalty-points"
        sx={{ textDecoration: 'underline' }}
        variant="caption"
        color="text.secondary"
      >
        here
      </Link>
      .
      <br />
      <br />
      <Trans>Aave Labs does not guarantee the program and accepts no liability.</Trans>
    </Box>
  );
};
