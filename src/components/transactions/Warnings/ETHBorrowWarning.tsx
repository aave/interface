import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon } from '@mui/material';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { Link } from 'src/components/primitives/Link';

export const ETHBorrowWarning = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <Trans>
            Ahead of the merge, ETH borrowing has been temporarily paused to mitigate liquidity
            risk.{' '}
            <Link
              href="https://snapshot.org/#/aave.eth/proposal/0xa121311c67b7a5bbe5b8b5fe1911663a0ab94ed339a6a4b0e1b9443f670a0e97"
              underline="always"
            >
              <Trans>Learn more</Trans>
            </Link>
            {'.'}
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
