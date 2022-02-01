import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

export const ApprovalInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Approval</Trans>}>
      <Typography>
        <Trans>Define Approval text</Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
