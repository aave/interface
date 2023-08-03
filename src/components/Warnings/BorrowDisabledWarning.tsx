import { Trans } from '@lingui/macro';

import { getFrozenProposalLink } from '../infoTooltips/FrozenTooltip';
import { Link } from '../primitives/Link';

interface BorrowDisabledWarningProps {
  symbol: string;
  currentMarket: string;
}
export const BorrowDisabledWarning = ({ symbol, currentMarket }: BorrowDisabledWarningProps) => {
  return (
    <Trans>
      Borrowing is disabled due to an Mooncake Finance community decision.{' '}
      <Link
        href={getFrozenProposalLink(symbol, currentMarket)}
        sx={{ textDecoration: 'underline' }}
      >
        <Trans>More details</Trans>
      </Link>
    </Trans>
  );
};
