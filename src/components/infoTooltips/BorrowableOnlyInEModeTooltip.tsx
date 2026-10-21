import { Trans } from '@lingui/macro';

import { TextWithTooltip } from '../TextWithTooltip';
import { BorrowableOnlyInEModeWarning } from '../Warnings/BorrowableOnlyInEModeWarning';

interface BorrowableOnlyInEModeTooltipProps {
  eModeLabels: string[];
}
export const BorrowableOnlyInEModeTooltip = ({
  eModeLabels,
}: BorrowableOnlyInEModeTooltipProps) => {
  return (
    <TextWithTooltip
      text={<Trans>E-Mode only</Trans>}
      variant="description"
      textColor="fg-3"
      iconSize={12}
      wrapperProps={{ sx: { mt: '2px' } }}
    >
      <BorrowableOnlyInEModeWarning eModeLabels={eModeLabels} />
    </TextWithTooltip>
  );
};
