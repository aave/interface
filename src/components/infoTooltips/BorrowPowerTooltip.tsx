import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const BorrowPowerTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        The % of your total borrowing power used. This is based on the amount of your collateral
        supplied and the total amount that you can borrow.
      </Trans>
    </TextWithTooltip>
  );
};
