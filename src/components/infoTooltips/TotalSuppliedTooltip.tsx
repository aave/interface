import { Trans } from '@lingui/macro';
import { Link } from '@mui/material';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const TotalSuppliedTooltip = ({ ...rest }: TextWithTooltipProps) => (
  <TextWithTooltip {...rest}>
    <>
      <Trans>
        Asset supply is limited to a certain amount to reduce protocol exposure to the asset and to
        help manage risks involved.
      </Trans>
      <br />
      <Link href="#" target="_blank" rel="noopener">
        <Trans>Learn more</Trans>
      </Link>
    </>
  </TextWithTooltip>
);
