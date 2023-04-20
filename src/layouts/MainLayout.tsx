import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import React, { ReactNode } from 'react';

import { AppHeader } from './AppHeader';
import TopBarNotify from './TopBarNotify';

const notifyText = (
  <Trans>
    An upcoming AIP will adjust E-mode, and if passed, could cause account liquidations. See the
    snapshot for more info
  </Trans>
);

// Gaunlet AIP for emode liquidations
const learnMoreLink =
  'https://snapshot.org/#/aave.eth/proposal/0x84deca82139320b2570f04211b249e37b8a7602b4a0ed70e6fa772c9f6e94550';

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
