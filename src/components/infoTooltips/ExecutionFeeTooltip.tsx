import { Trans } from '@lingui/macro';

import { TextWithTooltip } from '../TextWithTooltip';

export const ExecutionFeeTooltip = () => {
  return (
    <TextWithTooltip variant="caption" text={<Trans>Execution fee</Trans>}>
      <Trans>This is the fee for executing position changes, set by governance.</Trans>
    </TextWithTooltip>
  );
};
