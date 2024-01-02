import { Trans } from '@lingui/macro';
import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { MainLayout } from 'src/layouts/MainLayout';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsV3List } from 'src/modules/governance/ProposalsV3List';
import { UserGovernanceInfo } from 'src/modules/governance/UserGovernanceInfo';
import { useRootStore } from 'src/store/root';

import { ContentContainer } from '../../src/components/ContentContainer';

const GovDelegationModal = dynamic(() =>
  import('../../src/components/transactions/GovDelegation/GovDelegationModal').then(
    (module) => module.GovDelegationModal
  )
);

const GovRepresentativesModal = dynamic(() =>
  import('../../src/components/transactions/GovRepresentatives/GovRepresentativesModal').then(
    (module) => module.GovRepresentativesModal
  )
);

enum Tabs {
  PROPOSALS,
  INFORMATION,
}

export default function Governance() {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('lg'));
  const [mode, setMode] = useState(Tabs.PROPOSALS);
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Governance',
    });
  }, [trackEvent]);
  return (
    <>
      <GovernanceTopPanel />
      <ContentContainer>
        <StyledToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_, value) => setMode(value)}
          sx={{
            width: { xs: '100%', xsm: '359px' },
            height: '44px',
            mb: 4,
            display: { xs: 'flex', lg: 'none' },
          }}
        >
          <StyledToggleButton value={Tabs.PROPOSALS} disabled={mode === Tabs.PROPOSALS}>
            <Typography variant="subheader1">
              <Trans>Proposals</Trans>
            </Typography>
          </StyledToggleButton>
          <StyledToggleButton value={Tabs.INFORMATION} disabled={mode === Tabs.INFORMATION}>
            <Typography variant="subheader1">
              <Trans>Your info</Trans>
            </Typography>
          </StyledToggleButton>
        </StyledToggleButtonGroup>
        {isMobile ? (
          mode === Tabs.PROPOSALS ? (
            <ProposalsV3List />
          ) : (
            <UserGovernanceInfo />
          )
        ) : (
          <Grid container spacing={4}>
            <Grid item md={8}>
              <ProposalsV3List />
            </Grid>
            <Grid item md={4}>
              <UserGovernanceInfo />
            </Grid>
          </Grid>
        )}
      </ContentContainer>
    </>
  );
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovDelegationModal />
      <GovRepresentativesModal />
    </MainLayout>
  );
};
