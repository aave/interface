import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import * as React from 'react';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const GovernanceTopPanel = () => {
  return (
    <TopInfoPanel pageTitle={<Trans>Aave Protocol Governance</Trans>}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap',
          maxWidth: 'sm',
        }}
      >
        <Typography variant="description">
          <Trans>
            Aave is a fully decentralized, community governed protocol by the AAVE token-holders.
            AAVE token-holders collectively discuss, propose, and vote on upgrades to the protocol.
            AAVE token-holders can either vote themselves on new proposals or delagate to an address
            of choice. To learn more check out our Governance docs.
          </Trans>
        </Typography>
      </Box>
    </TopInfoPanel>
  );
};
