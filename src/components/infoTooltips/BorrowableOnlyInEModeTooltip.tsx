import { Trans } from '@lingui/macro';

import { TextWithTooltip } from '../TextWithTooltip';

export const BorrowableOnlyInEModeTooltip = () => {
  return (
    <TextWithTooltip
      text={<Trans>E-Mode only</Trans>}
      variant="description"
      textColor="fg-3"
      iconSize={12}
      wrapperProps={{ sx: { mt: '2px' } }}
    >
      <Trans>Borrowing is only available in E-Mode</Trans>
    </TextWithTooltip>
  );
};
