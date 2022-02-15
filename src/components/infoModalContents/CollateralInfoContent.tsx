import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

export const CollateralInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Collateral</Trans>}>
      <Typography>
        <Trans>
          The total amount of your assets denominated in USD that can be used as collateral for
          borrowing assets
        </Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
