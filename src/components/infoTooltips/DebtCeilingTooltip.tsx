import { Trans } from '@lingui/macro';
import { Link } from '@mui/material';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const DebtCeilingTooltip = ({ ...rest }: TextWithTooltipProps) => (
  <TextWithTooltip {...rest}>
    <>
      <Trans>
        Debt ceiling limits the amount possible to borrow against this asset by protocol users.
      </Trans>{' '}
      <Link
        href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
        target="_blank"
        rel="noopener"
      >
        <Trans>Learn more</Trans>
      </Link>
    </>
  </TextWithTooltip>
);
