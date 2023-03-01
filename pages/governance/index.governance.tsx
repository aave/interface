import { Trans } from '@lingui/macro';
import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { GovDelegationModal } from 'src/components/transactions/GovDelegation/GovDelegationModal';
import { AaveTokensBalanceProvider } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsList } from 'src/modules/governance/ProposalsList';
import { UserGovernanceInfo } from 'src/modules/governance/UserGovernanceInfo';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';

import { ContentContainer } from '../../src/components/ContentContainer';

export const getStaticProps = async () => {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();

  const proposals = [...Array(ProposalFetcher.count()).keys()].map((id) => {
    const ipfs = IpfsFetcher.get(id);
    const proposal = ProposalFetcher.get(id);
    return {
      ipfs: {
        title: ipfs.title,
        id: ipfs.id,
        originalHash: ipfs.originalHash,
        shortDescription: ipfs.shortDescription,
      },
      proposal,
      prerendered: true,
    };
  });

  return { props: { proposals: proposals.slice().reverse() } };
};

enum Tabs {
  PROPOSALS,
  INFORMATION,
}

export type GovernancePageProps = {
  proposals: {
    ipfs: Pick<IpfsType, 'title' | 'id' | 'originalHash' | 'shortDescription'>;
    proposal: CustomProposalType;
    prerendered: boolean;
  }[];
};

export default function Governance(props: GovernancePageProps) {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('lg'));
  const [mode, setMode] = useState(Tabs.PROPOSALS);

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
            <ProposalsList {...props} />
          ) : (
            <UserGovernanceInfo />
          )
        ) : (
          <Grid container spacing={4}>
            <Grid item md={8}>
              <ProposalsList {...props} />
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
      <GovernanceDataProvider />
      <AaveTokensBalanceProvider>
        {page}
        <GovDelegationModal />
      </AaveTokensBalanceProvider>
    </MainLayout>
  );
};
