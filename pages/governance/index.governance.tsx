import { Grid, Paper } from '@mui/material';
import { GovDelegationModal } from 'src/components/transactions/GovDelegation/GovDelegationModal';
import { AaveTokensBalanceProvider } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsList } from 'src/modules/governance/ProposalsList';
import { VotingPowerInfoPanel } from 'src/modules/governance/VotingPowerInfoPanel';
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
      ipfs: { title: ipfs.title, id: ipfs.id, originalHash: ipfs.originalHash },
      proposal,
      prerendered: true,
    };
  });

  return { props: { proposals: proposals.slice().reverse() } };
};

export type GovernancePageProps = {
  proposals: {
    ipfs: Pick<IpfsType, 'title' | 'id' | 'originalHash'>;
    proposal: CustomProposalType;
    prerendered: boolean;
  }[];
};

export default function Governance(props: GovernancePageProps) {
  return (
    <>
      <GovernanceTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper>
              <VotingPowerInfoPanel />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper>
              <ProposalsList {...props} />
            </Paper>
          </Grid>
        </Grid>
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
