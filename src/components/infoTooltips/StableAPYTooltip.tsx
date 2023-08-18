import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const StableAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Stable interest rate will act as a fixed rate in the short term, but can be re-balanced in
        response to changes in market conditions.
      </Trans>
    </TextWithTooltip>
  );
};
