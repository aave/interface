import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

// TODO: need texts
export const BorrowPowerInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Borrow power</Trans>}>
      <Typography>
        <Trans>Borrow power</Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
