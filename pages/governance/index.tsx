import { Container, Grid, Paper } from '@mui/material';
import { InferGetStaticPropsType } from 'next';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsList } from 'src/modules/governance/ProposalsList';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { VotingPowerInfoPanel } from 'src/modules/governance/VotingPowerInfoPanel';
import { Ipfs } from 'src/static-build/ipfs';
import { Proposal } from 'src/static-build/proposal';

export const getStaticProps = async () => {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();
  const count = await governanceContract.getProposalsCount();

  const proposals = await Promise.all(
    [...Array(count).keys()].reverse().map(async (id) => {
      // TODO: only pass required ipfs data
      const ipfs = await IpfsFetcher.get(id);
      const proposal = await ProposalFetcher.get(id);
      return {
        ipfs,
        proposal,
        prerendered: true,
      };
    })
  );

  return { props: { proposals } };
};

export type GovernancePageProps = InferGetStaticPropsType<typeof getStaticProps>;

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
          <Paper>
            <ProposalsList {...props} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <GovernanceDataProvider>{page}</GovernanceDataProvider>
    </MainLayout>
  );
};
