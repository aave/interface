import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const VariableAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest} placement="bottom">
      <Trans>
        Variable interest rate will <b>fluctuate</b> based on the market conditions.
      </Trans>
    </TextWithTooltip>
  );
};
