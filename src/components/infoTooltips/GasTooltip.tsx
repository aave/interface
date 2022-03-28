import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const GasTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        This gas calculation is only an estimation. Your wallet will set the price of the
        transaction. Check there if you want to change its priority.
      </Trans>
    </TextWithTooltip>
  );
};
