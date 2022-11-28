import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { Link } from '../primitives/Link';

export const RenFILToolTip = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <Trans>
            This asset is frozen due to an Aave Protocol Governance decision. On the 20th of
            December 2022, renFIL will no longer be supported and cannot be bridged back to its
            native network. It is recommended to withdraw supply positions and repay borrow
            positions so that renFIL can be bridged back to FIL before the deadline. After this
            date, it will no longer be possible to convert renFIL to FIL.{' '}
            <Link
              href={'https://medium.com/renproject/moving-on-from-alameda-da62a823ce93'}
              sx={{ textDecoration: 'underline' }}
            >
              <Trans>More details</Trans>
            </Link>
          </Trans>
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: '20px', color: 'error.main', ml: 2 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  );
};
