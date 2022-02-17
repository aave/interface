import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const CollateralTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        The total amount of your assets denominated in USD that can be used as collateral for
        borrowing assets.
      </Trans>
    </TextWithTooltip>
  );
};
