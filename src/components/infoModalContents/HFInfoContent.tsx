import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { InfoContentWrapper } from './InfoContentWrapper';

export const HFInfoContent = () => {
  return (
    <InfoContentWrapper caption={<Trans>Health factor</Trans>}>
      <Typography>
        <Trans>
          The health factor represents the safety of your loan derived from the proportion of
          collateral versus amount borrowed. Keep it above 1 to avoid liquidation.
        </Trans>
      </Typography>
    </InfoContentWrapper>
  );
};
