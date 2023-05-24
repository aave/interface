import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const notifyText = (
  <Trans>
    <strong>Important: </strong>An Aave Governance Proposal regarding changes to E-Mode parameters
    is now live and may impact the health factor of certain positions.
  </Trans>
);

// Gaunlet AIP for emode liquidations
const learnMoreLink = 'https://app.aave.com/governance/proposal/?proposalId=233';

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopBarNotify notifyText={notifyText} learnMoreLink={learnMoreLink} />
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
    </>
  );
}
