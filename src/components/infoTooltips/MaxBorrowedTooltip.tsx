import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Link } from '@mui/material';
import { TextWithTooltip, TextWithTooltipProps } from '../TextWithTooltip';

export const MaxBorrowedTooltip = ({ ...rest }: TextWithTooltipProps) => (
  <Box sx={{ ml: 2 }}>
    <TextWithTooltip {...rest} icon={<ExclamationIcon />} color="warning.main" iconSize={18}>
      <>
        <Trans>Protocol borrow cap at 100% for this asset. Further supply unavailable.</Trans>
        <br />
        <Link href="#" target="_blank" rel="noopener">
          <Trans>Learn more</Trans>
        </Link>
      </>
    </TextWithTooltip>
  </Box>
);
