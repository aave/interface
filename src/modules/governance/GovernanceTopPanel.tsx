import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { ChainAvailabilityText } from 'src/components/ChainAvailabilityText';
import ExternalLinkButton from 'src/components/ExternalLinkButton';
import { Link } from 'src/components/primitives/Link';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const GovernanceTopPanel = () => {
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
          <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <img src={`/aave.svg`} width="32px" height="32px" alt="" />
            <Typography
              variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
              sx={{ ml: 2, mr: 3 }}
            >
              <Trans>Aave Governance</Trans>
            </Typography>
          </Box>

          <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
            <Trans>
              Aave is a fully decentralized, community governed protocol by the AAVE token-holders.
              AAVE token-holders collectively discuss, propose, and vote on upgrades to the
              protocol. AAVE token-holders (Ethereum network only) can either vote themselves on new
              proposals or delagate to an address of choice. To learn more check out the Governance
            </Trans>{' '}
            <Link
              href="https://docs.aave.com/faq/governance"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
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
          gap: '16px',
          flexWrap: 'wrap',
          maxWidth: 'sm',
        }}
      >
        <ExternalLinkButton
          size="small"
          variant="surface"
          target="_blank"
          rel="noopener"
          href="https://snapshot.org/#/aave.eth"
        >
          <Trans>SNAPSHOTS</Trans>
        </ExternalLinkButton>

        <ExternalLinkButton
          size="small"
          variant="surface"
          target="_blank"
          rel="noopener"
          href="https://governance.aave.com/"
        >
          <Trans>FORUM</Trans>
        </ExternalLinkButton>

        <ExternalLinkButton
          size="small"
          variant="surface"
          target="_blank"
          rel="noopener"
          href="https://docs.aave.com/faq/governance"
        >
          <Trans>FAQ</Trans>
        </ExternalLinkButton>
      </Box>
    </TopInfoPanel>
  );
};
