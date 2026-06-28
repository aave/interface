import { ExclamationIcon } from '@heroicons/react/outline';

import { TextWithTooltip } from '../TextWithTooltip';
import { StETHCollateralWarning } from '../Warnings/StETHCollateralWarning';

export const StETHCollateralToolTip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ ml: 2 }}
      color="warning.main"
      iconSize={20}
      icon={<ExclamationIcon />}
    >
      <StETHCollateralWarning />
    </TextWithTooltip>
  );
};
