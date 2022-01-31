import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

// TODO: need texts
export const CollateralInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Collateral</Trans>}>
      <Typography>
        <Trans>Collateral</Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
