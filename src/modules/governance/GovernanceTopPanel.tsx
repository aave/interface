import { Trans } from '@lingui/macro';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { Link } from 'src/components/primitives/Link';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

interface ExternalLinkProps {
  text: string;
  href: string;
}

function ExternalLink({ text, href }: ExternalLinkProps) {
  return (
    <Button
      variant="surface"
      size="small"
      sx={{ minWidth: 'unset' }}
      component={Link}
      href={href}
      target="_blank"
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {text}
        <SvgIcon sx={{ ml: 1, fontSize: 14 }}>
          <ExternalLinkIcon />
        </SvgIcon>
      </Box>
    </Button>
  );
}

export const GovernanceTopPanel = () => {
  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  return (
    <TopInfoPanel
      titleComponent={
        <Box mb={4}>
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
              protocol. AAVE token-holders can either vote themselves on new proposals or delagate
              to an address of choice. To learn more check out the Governance documentation
            </Trans>{' '}
            <Link
              // TODO: need check link
              href="https://docs.aave.com/faq/"
              sx={{ textDecoration: 'underline', color: '#8E92A3' }}
            >
              <Trans>here.</Trans>
            </Link>
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
        <ExternalLink text="SNAPSHOTS" href="https://snapshot.org/#/aave.eth" />
        <ExternalLink text="FORUM" href="https://governance.aave.com/" />
        <ExternalLink text="FAQ" href="https://docs.aave.com/faq/" />
      </Box>
    </TopInfoPanel>
  );
};
