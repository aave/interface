import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const SwapFeeTooltip = () => {
  return (
    <TextWithTooltip variant="caption" text={<Trans>Fee</Trans>}>
      <Trans>
        Fees help support the user experience and security of the Aave application.{' '}
        <Link
          href="https://aave.com/docs/developers/smart-contracts/swap-features"
          target="_blank"
          rel="noopener"
        >
          Learn more.
        </Link>
      </Trans>
    </TextWithTooltip>
  );
};
