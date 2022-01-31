import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

// TODO: need text
export const EModeInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>E-mode</Trans>}>
      <Typography>
        <Trans>E-mode</Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
