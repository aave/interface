import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

export const BorrowPowerInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Borrowing Power</Trans>}>
      <Typography>
        <Trans>
          The % of your total bowering power used. This is based on the amount of your collateral
          deposited and the total amount that you can borrow.
        </Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
