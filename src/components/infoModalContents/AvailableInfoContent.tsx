import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { CapType } from '../caps/helper';
import { TextWithModal, TextWithModalProps } from '../TextWithModal';
import { InfoContentWrapper } from './InfoContentWrapper';

interface AvailableInfoContentProps extends TextWithModalProps {
  capType: CapType;
}

export const AvailableInfoContent = ({ capType, ...rest }: AvailableInfoContentProps) => {
  const formattedTitle =
    capType === CapType.supplyCap ? (
      <Trans>Available to supply</Trans>
    ) : (
      <Trans>Available to borrow</Trans>
    );
  const description =
    capType === CapType.supplyCap ? (
      <Trans>
        This is the total amount that you are able to supply to in this reserve. You are able to
        supply your wallet balance up until the supply cap is reached.
      </Trans>
    ) : (
      <Trans>
        This is the total amount available for you to borrow. You can borrow based on your
        collateral and until the borrow cap is reached.
      </Trans>
    );

  return (
    <TextWithModal icon={<QuestionMarkCircleIcon />} iconSize={12} withContentButton {...rest}>
      <InfoContentWrapper caption={formattedTitle}>
        <Typography>{description}</Typography>
      </InfoContentWrapper>
    </TextWithModal>
  );
};
