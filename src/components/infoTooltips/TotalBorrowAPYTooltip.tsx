import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const TotalBorrowAPYTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        <Trans>The weighted average of APY for all borrowed assets, including incentives.</Trans>
      </Trans>
    </TextWithTooltip>
  );
};
