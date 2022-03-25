import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const NetAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        Net APY is the combined effect of all supply and borrow positions on net worth, including
        incentives. It is possible to have a negative net APY if debt APY is higher than supply APY.
      </Trans>
    </TextWithTooltip>
  );
};
