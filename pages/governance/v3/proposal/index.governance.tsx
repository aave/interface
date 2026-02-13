import { GridLegacy } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Meta } from 'src/components/Meta';
import { useProposal } from 'src/hooks/governance/useProposal';
import { useProposalVotes } from 'src/hooks/governance/useProposalVotes';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalLifecycle } from 'src/modules/governance/proposal/ProposalLifecycle';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
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
        <GridLegacy container spacing={4}>
          <GridLegacy item xs={12} md={8}>
            <ProposalOverview
              proposal={proposal}
              error={!!newProposalError}
              loading={proposalLoading}
            />
          </GridLegacy>
          <GridLegacy item xs={12} md={4}>
            {proposal && <VoteInfo proposal={proposal} />}
            <VotingResults
              proposal={proposal}
              proposalVotes={proposalVotes}
              loading={proposalLoading}
            />
            <ProposalLifecycle proposal={proposal} />
          </GridLegacy>
        </GridLegacy>
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
