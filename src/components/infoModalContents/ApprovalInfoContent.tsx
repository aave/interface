import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { Link } from '../primitives/Link';
import { InfoContentWrapper } from './InfoContentWrapper';

export const ApprovalInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Approval</Trans>}>
      <Typography>
        <Trans>
          Before supplying, you need to approve its usage by the Aave protocol. You can learn more
          in our F
          <Link fontWeight={500} href={'https://docs.aave.com/faq/'}>
            AQ
          </Link>
        </Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
