import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const MaxRepayWithCollateralTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        The available balance is the minimum of your wallet balance, amount needed to pay off all
        debt, or amount needed to remain above liquidation threshold.
      </Trans>
    </TextWithTooltip>
  );
};
