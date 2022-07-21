import { Trans } from '@lingui/macro';
import { Link } from '@mui/material';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const TotalBorrowedTooltip = ({ ...rest }: TextWithTooltipProps) => (
  <TextWithTooltip {...rest}>
    <>
      <Trans>
        Borrowing of this asset is limited to a certain amount to minimize liquidity pool
        insolvency.
      </Trans>{' '}
      <Link href="#" target="_blank" rel="noopener">
        <Trans>Learn more</Trans>
      </Link>
    </>
  </TextWithTooltip>
);
