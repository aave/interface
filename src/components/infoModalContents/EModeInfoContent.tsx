import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { Link } from '../primitives/Link';
import { InfoContentWrapper } from './InfoContentWrapper';

export const EModeInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Efficiency Mode(E-Mode)</Trans>}>
      <Typography>
        <Trans>
          E-Mode increases your borrowing power for a selected category of assets up to 99%.Enabling
          E-Mode only allows you to borrow assets belonging to the selected category Stablecoins.
          Please visit out
          <Link href="https://docs.aave.com/faq/" variant="main14" sx={{ ml: 1 }}>
            <Trans>FAQ guide </Trans>
          </Link>
          to learn more about how it works.
        </Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
