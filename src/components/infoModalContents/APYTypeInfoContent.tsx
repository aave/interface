import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { TextWithModal, TextWithModalProps } from '../TextWithModal';
import { InfoContentWrapper } from './InfoContentWrapper';

export const APYTypeInfoContent = ({ ...rest }: TextWithModalProps) => {
  return (
    <TextWithModal icon={<InformationCircleIcon />} iconSize={14} withContentButton {...rest}>
      <InfoContentWrapper caption={<Trans>Stable Interest</Trans>}>
        <Typography sx={{ mb: 5 }}>
          <Trans>
            Your interest rate will stay the same for the duration of your loan. Recommended for
            long-term loan periods and for users who prefer predictability.
          </Trans>
        </Typography>
        <Typography variant="h2" sx={{ mb: 2 }}>
          <Trans>Variable Interest</Trans>
        </Typography>
        <Typography>
          <Trans>
            Your interest rate will fluctuate based on the market. Recommended for short-term loans.
          </Trans>
        </Typography>
      </InfoContentWrapper>
    </TextWithModal>
  );
};
