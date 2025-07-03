import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const GhoRateTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Estimated compounding interest rate, that is determined by Aave Governance. This rate may be
        changed over time depending on the need for the GHO supply to contract/expand.
      </Trans>
    </TextWithTooltip>
  );
};
