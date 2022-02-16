import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { Link } from '../primitives/Link';
import { InfoContentWrapper } from './InfoContentWrapper';

export const ApprovalInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Approval</Trans>}>
      <Typography>
        <Trans
          id="Before initiating a transaction within Aave you must sign and approve it. It doesnt cost
          anything to sign. You can learn more in our <0>FAQ</0> "
          components={[<Link key={0} fontWeight={500} href={'https://docs.aave.com/faq/'} />]}
        />
      </Typography>
    </InfoContentWrapper>
  );
};
