import { Trans } from '@lingui/macro';
import { Link } from '../primitives/Link';

import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const EModeTooltip = ({ ...rest }: TextWithTooltipProps) => {
  return (
    <TextWithTooltip {...rest}>
      <Trans>
        E-Mode increases your LTV for a selected category of assets up to 97%.{' '}
        <Link
          href="https://docs.aave.com/faq/"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Trans>
    </TextWithTooltip>
  );
};
