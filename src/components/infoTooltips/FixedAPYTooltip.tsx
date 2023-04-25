import { Trans } from '@lingui/macro';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type FixedToolTipProps = TextWithTooltipProps;

export const FixedAPYTooltip = (props: FixedToolTipProps) => {
  return (
    <TextWithTooltip {...props}>
      {
        <Trans>
          Static interest rate that is determined by Aave Governance. This rate may be changed over
          time depending on the need for the GHO supply to contract/expand. Learn more
        </Trans>
      }
    </TextWithTooltip>
  );
};
