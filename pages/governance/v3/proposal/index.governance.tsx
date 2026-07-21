import { Grid } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Meta } from 'src/components/Meta';
import {
  useGovernanceProposalDetail,
  useGovernanceProposalPayloads,
  useGovernanceVotersSplit,
} from 'src/hooks/governance/useGovernanceCache';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
import { ProposalPayloads } from 'src/modules/governance/proposal/ProposalPayloads';
import { ProposalTimeline } from 'src/modules/governance/proposal/ProposalTimeline';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';
import { VotingResults } from 'src/modules/governance/proposal/VotingResults';

import { ContentContainer } from '../../../../src/components/ContentContainer';

const GovVoteModal = dynamic(() =>
  import('../../../../src/components/transactions/GovVote/GovVoteModal').then(
    (module) => module.GovVoteModal
  )
);

export default function ProposalPage() {
  const { query } = useRouter();
  const proposalId = Number(query.proposalId);

  const {
    data: proposal,
    isLoading: proposalLoading,
    error: proposalError,
  } = useGovernanceProposalDetail(proposalId);

  const voters = useGovernanceVotersSplit(proposalId);
  const { data: payloads, isLoading: payloadsLoading } = useGovernanceProposalPayloads(proposalId, {
    enabled: !!proposal?.rawCacheDetail,
  });

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
            <ProposalOverview
              proposal={proposal ?? undefined}
              error={!!proposalError}
              loading={proposalLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {proposal?.voteProposalData && <VoteInfo voteData={proposal.voteProposalData} />}
            <VotingResults
              proposal={proposal}
              voters={voters}
              loading={proposalLoading}
              votesLoading={voters.isFetching}
            />
            <ProposalPayloads payloads={payloads} loading={payloadsLoading} />
            {proposal?.rawCacheDetail ? (
              <ProposalTimeline
                proposal={proposal.rawCacheDetail}
                payloads={payloads}
                payloadsLoading={payloadsLoading}
              />
            ) : null}
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
