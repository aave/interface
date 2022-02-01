import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

export const RetryWithApprovalInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Retry with Approval</Trans>}>
      <Typography>
        <Trans>Define Retry with Approval text</Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
