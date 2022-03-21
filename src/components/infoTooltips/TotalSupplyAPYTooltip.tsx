import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const TotalSupplyAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>The weighted average of APY for all supplied assets, including incentives.</Trans>
    </TextWithTooltip>
  );
};
