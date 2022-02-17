import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { Link } from '../primitives/Link';

export const AMPLWarning = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <Trans>
            <b>Ampleforth</b> is an asset affected by rebasing. Visit the{' '}
            <Link href="https://docs.aave.com/developers/guides/ampl-asset-listing">
              <Trans>documentation</Trans>
            </Link>{' '}
            or{' '}
            <Link href="https://faq.ampleforth.org/lending_and_borrowing">
              <Trans>{"Ampleforth's FAQ"}</Trans>
            </Link>{' '}
            to learn more.
          </Trans>
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'warning.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
