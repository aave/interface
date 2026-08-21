import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { ChainAvailabilityText } from 'src/components/ChainAvailabilityText';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

interface ExternalLinkProps {
  text: string;
  href: string;
}

function ExternalLink({ text, href }: ExternalLinkProps) {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Button
      variant="tertiary"
      size="small"
      component={Link}
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(GENERAL.EXTERNAL_LINK, { Link: text })}
      endIcon={<ArrowUpRightIcon sx={{ color: 'fg-3' }} />}
      sx={{ minWidth: 'unset' }}
    >
      {text}
    </Button>
  );
}

export const GovernanceTopPanel = () => {
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}>
              <Trans>Aave Governance</Trans>
            </Typography>
          </Box>

          <Typography sx={{ color: 'fg-3', maxWidth: '824px' }}>
            <Trans>
              Aave is a fully decentralized, community governed protocol by the AAVE token-holders.
              AAVE token-holders collectively discuss, propose, and vote on upgrades to the
              protocol. AAVE token-holders (Ethereum network only) can either vote themselves on new
              proposals or delagate to an address of choice. To learn more check out the Governance
            </Trans>{' '}
            <Link
              onClick={() => trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'FAQ Docs Governance' })}
              href="https://aave.com/docs/ecosystem/governance"
              sx={{ textDecoration: 'underline', color: 'fg-3' }}
            >
              <Trans>documentation</Trans>
            </Link>
            .
          </Typography>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          maxWidth: 'sm',
        }}
      >
        <ExternalLink text="Snapshots" href="https://snapshot.org/#/aave.eth" />
        <ExternalLink text="Forum" href="https://governance.aave.com/" />
        <ExternalLink text="FAQ" href="https://aave.com/docs/ecosystem/governance" />
        <ExternalLink text="Governance V2" href="https://governance-v2.aave.com/" />
      </Box>
    </TopInfoPanel>
  );
};
