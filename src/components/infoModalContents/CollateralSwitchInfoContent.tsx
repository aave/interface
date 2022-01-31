import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import Typography from '@mui/material/Typography';

import { TextWithModal, TextWithModalProps } from '../TextWithModal';
import { InfoContentWrapper } from './InfoContentWrapper';

export const CollateralSwitchInfoContent = ({ ...rest }: TextWithModalProps) => {
  return (
    <TextWithModal icon={<InformationCircleIcon />} iconSize={14} withContentButton {...rest}>
      <InfoContentWrapper caption={<Trans>Adding and removing assets as collateral</Trans>}>
        <Typography>
          <Trans>
            Allows you to decide whether to use a supplied asset as collateral. An asset used as
            collateral will affect your borrowing power and health factor.
          </Trans>
        </Typography>
      </InfoContentWrapper>
    </TextWithModal>
  );
};
