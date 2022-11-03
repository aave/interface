import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const GHOBorrowRateTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>GHO borrow rate can be discounted by holding stkAave.</Trans>
    </TextWithTooltip>
  );
};
