import { Container, Grid, Paper } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsList } from 'src/modules/governance/ProposalsList';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { VotingPowerInfoPanel } from 'src/modules/governance/VotingPowerInfoPanel';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';

export const getStaticProps = async () => {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();
  const count = await governanceContract.getProposalsCount();

  const proposals: FullProposal[] = [];
  for (let i = 0; i < count; i++) {
    const ipfs = await IpfsFetcher.get(i);
    const proposal = await ProposalFetcher.get(i);
    proposals.push({
      ipfs,
      proposal,
      prerendered: true,
    });
  }

  return { props: { proposals } };
};

interface FullProposal {
  prerendered: boolean;
  proposal: CustomProposalType;
  ipfs: IpfsType;
}

export type GovernancePageProps = { proposals: FullProposal[] };

export default function Governance(props: GovernancePageProps) {
  return (
    <Container maxWidth="xl">
      <GovernanceTopPanel />
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ px: 6, py: 4 }}>
            <VotingPowerInfoPanel />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ px: 6, py: 4 }}>
            <ProposalsList {...props} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
