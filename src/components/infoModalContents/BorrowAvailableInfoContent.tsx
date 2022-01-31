import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { TextWithModal, TextWithModalProps } from '../TextWithModal';
import { InfoContentWrapper } from './InfoContentWrapper';

export const BorrowAvailableInfoContent = ({ ...rest }: TextWithModalProps) => {
  return (
    <TextWithModal icon={<InformationCircleIcon />} iconSize={14} withContentButton {...rest}>
      <InfoContentWrapper caption={<Trans>Available to borrow</Trans>}>
        <Typography>
          <Trans>
            This is the total amount available for you to borrow. You can borrow based on your
            collateral and until the borrow cap is reached.
          </Trans>
        </Typography>
      </InfoContentWrapper>
    </TextWithModal>
  );
};
