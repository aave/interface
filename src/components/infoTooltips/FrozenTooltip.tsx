import { ExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon } from '@mui/material';

import { frozenProposalMap } from '../../utils/marketsAndNetworksConfig';
import { ContentWithTooltip } from '../ContentWithTooltip';
import { Link } from '../primitives/Link';

interface FrozenTooltipProps {
  symbol?: string;
  currentMarket?: string;
}

export const getFrozenProposalLink = (
  symbol: string | undefined,
  currentMarket: string | undefined
): string => {
  if (currentMarket && currentMarket === 'proto_harmony_v3') {
    return 'https://snapshot.org/#/aave.eth/proposal/0x81a78109941e5e0ac6cb5ebf82597c839c20ad6821a8c3ff063dba39032533d4';
  } else if (currentMarket && currentMarket === 'proto_fantom_v3') {
    return 'https://snapshot.org/#/aave.eth/proposal/0xeefcd76e523391a14cfd0a79b531ea0a3faf0eb4a058e255fac13a2d224cc647';
  } else if (symbol && frozenProposalMap[symbol + currentMarket]) {
    return frozenProposalMap[symbol + currentMarket];
  } else {
    return 'https://app.aave.com/governance';
  }
};

export const FrozenTooltip = ({ symbol, currentMarket }: FrozenTooltipProps) => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <Trans>
            This asset is frozen due to an Aave Protocol Governance decision.{' '}
            <Link
              href={getFrozenProposalLink(symbol, currentMarket)}
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
