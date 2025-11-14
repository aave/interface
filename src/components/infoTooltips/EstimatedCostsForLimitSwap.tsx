import { Trans } from '@lingui/macro';

import { TextWithTooltip } from '../TextWithTooltip';

export const EstimatedCostsForLimitSwapTooltip = () => {
  return (
    <TextWithTooltip variant="caption" text={<Trans>Estimated Costs & Fees</Trans>}>
      <Trans>
        These are the estimated costs associated with your limit swap, including costs and fees.
        Consider these costs when setting your order amounts to help optimize execution and maximize
        your chances of filling the order.
      </Trans>
    </TextWithTooltip>
  );
};
