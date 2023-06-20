import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

type FixedToolTipProps = TextWithTooltipProps;

export const FixedAPYTooltipText = (
  <Trans>
    Static interest rate that is determined by Aave Governance. This rate may be changed over time
    depending on the need for the GHO supply to contract/expand.{' '}
    <Link
      href="https://docs.gho.xyz/concepts/how-gho-works/interest-rate-discount-model#interest-rate-model"
      underline="always"
    >
      <Trans>Learn more</Trans>
    </Link>
  </Trans>
);

export const FixedAPYTooltip = (props: FixedToolTipProps) => {
  return <TextWithTooltip {...props}>{FixedAPYTooltipText}</TextWithTooltip>;
};
