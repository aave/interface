import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link } from '@mui/material';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const MaxDebtCeilingTooltip = ({ ...rest }: TextWithTooltipProps) => (
  <Box sx={{ ml: 2 }}>
    <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="error.main" iconSize={18}>
      <>
        <Trans>
          Protocol debt ceiling is at 100% for this asset. Futher borrowing against this asset is
          unavailable.
        </Trans>
        <br />
        <Link href="#" target="_blank" rel="noopener">
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  </Box>
);
