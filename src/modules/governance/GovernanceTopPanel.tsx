import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ChainAvailabilityText } from 'src/components/ChainAvailabilityText';
import { ExternalLinkButton } from 'src/components/ExternalLinkButton';
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
    <ExternalLinkButton
      href={href}
      onClick={() => trackEvent(GENERAL.EXTERNAL_LINK, { Link: text })}
    >
      {text}
    </ExternalLinkButton>
  );
}

export const GovernanceTopPanel = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: '1.875rem' }}>
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
