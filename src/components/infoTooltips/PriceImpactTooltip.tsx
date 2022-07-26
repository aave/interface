import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const PriceImpactTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest} variant="secondary12" color="text.secondary">
      <Trans>
        Price impact is the spread between the total value of the entry tokens swapped and the
        destination tokens obtained (in USD), which results from the limited liquidity of the
        trading pair.
      </Trans>
    </TextWithTooltip>
  );
};
