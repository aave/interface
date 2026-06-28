import { Trans } from '@lingui/macro';

import { TextWithTooltip } from '../TextWithTooltip';

export const NetworkCostTooltip = () => {
  return (
    <TextWithTooltip variant="caption" text={<Trans>Network costs</Trans>}>
      <Trans>
        This is the cost of settling your order on-chain, including gas and any LP fees.
      </Trans>
    </TextWithTooltip>
  );
};
