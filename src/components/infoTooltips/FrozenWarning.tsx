import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon } from '@mui/material';

import { ContentWithTooltip } from '../ContentWithTooltip';
import { Link } from '../primitives/Link';
import { frozenProposalMap } from '../../utils/marketsAndNetworksConfig';

interface FrozenWarningProps {
  symbol?: string;
}

export const FrozenWarning = ({ symbol }: FrozenWarningProps) => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <Trans>
            {symbol} is frozen due to an Aave Protocol Governance decision.{' '}
            <Link
              href={
                symbol && frozenProposalMap[symbol]
                  ? frozenProposalMap[symbol]
                  : 'https://app.aave.com/governance'
              }
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
