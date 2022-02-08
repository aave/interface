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
            Aavenomics introduces a formalized path to the decentralisation and autonomy of the Aave
            Protocol. Covering governance mechanisms and financial incentives, it aims to share a
            vision of alignment between various stakeholders within the Aave ecosystem, protocol
            functionality and the AAVE token as a core securing element of the Aave Protocol. You
            can find all the details here.
          </Trans>
        </Typography>
      </Box>
    </TopInfoPanel>
  );
};
