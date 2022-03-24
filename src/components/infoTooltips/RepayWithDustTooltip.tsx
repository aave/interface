import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const RepayWithDustTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        You don’t have enough funds in your wallet to repay the full amount. If you proceed to repay
        with your current amount of funds, you will still have a small borrowing position in your
        dashboard.
      </Trans>
    </TextWithTooltip>
  );
};
