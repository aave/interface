import { Grid } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Meta } from 'src/components/Meta';
import { useProposal } from 'src/hooks/governance/useProposal';
import {
  useProposalDetailCache,
  useProposalVotesSplitCache,
} from 'src/hooks/governance/useProposalDetailCache';
import { useProposalVotes } from 'src/hooks/governance/useProposalVotes';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalLifecycle } from 'src/modules/governance/proposal/ProposalLifecycle';
import { ProposalLifecycleCache } from 'src/modules/governance/proposal/ProposalLifecycleCache';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
import { ProposalOverviewCache } from 'src/modules/governance/proposal/ProposalOverviewCache';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';
import { VotingResults } from 'src/modules/governance/proposal/VotingResults';
import { VotingResultsCache } from 'src/modules/governance/proposal/VotingResultsCache';

import { ContentContainer } from '../../../../src/components/ContentContainer';

const GovVoteModal = dynamic(() =>
  import('../../../../src/components/transactions/GovVote/GovVoteModal').then(
    (module) => module.GovVoteModal
  )
);

// Toggle between local cache and subgraph flag
const USE_GOVERNANCE_CACHE = process.env.NEXT_PUBLIC_USE_GOVERNANCE_CACHE === 'true';

function ProposalPageSubgraph() {
  const { query } = useRouter();
  const proposalId = Number(query.proposalId);
  const {
    data: proposal,
    isLoading: proposalLoading,
    error: newProposalError,
  } = useProposal(proposalId);

  const proposalVotes = useProposalVotes({
    proposalId,
    votingChainId: proposal
      ? +proposal.subgraphProposal.votingPortal.votingMachineChainId
      : undefined,
  });

  return (
    <>
      {proposal && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={proposal.subgraphProposal.proposalMetadata.title}
          description={proposal.subgraphProposal.proposalMetadata.shortDescription}
        />
      )}
      <ProposalTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <ProposalOverview
              proposal={proposal}
              error={!!newProposalError}
              loading={proposalLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {proposal && <VoteInfo proposal={proposal} />}
            <VotingResults
              proposal={proposal}
              proposalVotes={proposalVotes}
              loading={proposalLoading}
            />
            <ProposalLifecycle proposal={proposal} />
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

function ProposalPageCache() {
  const { query } = useRouter();
  const proposalId = Number(query.proposalId);

  const {
    data: proposal,
    isLoading: proposalLoading,
    error: proposalError,
  } = useProposalDetailCache(proposalId);

  const { yaeVotes, nayVotes, isFetching: votesLoading } = useProposalVotesSplitCache(proposalId);

  return (
    <>
      {proposal && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={proposal.title}
          description={proposal.shortDescription}
        />
      )}
      <ProposalTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <ProposalOverviewCache
              proposal={proposal}
              error={!!proposalError}
              loading={proposalLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <VotingResultsCache
              proposal={proposal}
              yaeVotes={yaeVotes}
              nayVotes={nayVotes}
              loading={proposalLoading}
              votesLoading={votesLoading}
            />
            <ProposalLifecycleCache proposal={proposal} />
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

export default function ProposalPage() {
  return USE_GOVERNANCE_CACHE ? <ProposalPageCache /> : <ProposalPageSubgraph />;
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
