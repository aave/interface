import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const NetAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        The weighted average of all supply and borrow positions, including incentives. It is
        possible to have a negative net APY if debt APY is higher than supply APY.
      </Trans>
    </TextWithTooltip>
  );
};
