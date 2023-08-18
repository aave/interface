import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const APYTypeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <>
        <Trans>
          Allows you to switch between <b>variable</b> and <b>stable</b> interest rates, where
          variable rate can increase and decrease depending on the amount of liquidity in the
          reserve, and stable rate will act as a fixed rate in the short term, but can be
          re-balanced in response to changes in market conditions.
        </Trans>{' '}
        <Link
          href="https://docs.aave.com/faq/borrowing#what-is-the-difference-between-stable-and-variable-rate"
          underline="always"
        >
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  );
};
