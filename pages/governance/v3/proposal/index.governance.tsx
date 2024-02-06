import { Grid } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Meta } from 'src/components/Meta';
import { usePayloadsData } from 'src/hooks/governance/usePayloadsData';
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
    isLoading: newProposalLoading,
    error: newProposalError,
  } = useProposal(proposalId);

  const payloadParams =
    proposal?.proposal.payloads.map((p) => {
      return {
        payloadControllerAddress: p.payloadsController,
        payloadId: +p.id.split('_')[1],
        chainId: +p.chainId,
      };
    }) || [];

  const { data: payloadData } = usePayloadsData(payloadParams);

  const proposalVotes = useProposalVotes({
    proposalId,
    votingChainId: proposal ? +proposal.proposal.votingPortal.votingMachineChainId : undefined,
  });

  const loading = newProposalLoading;

  return (
    <>
      {proposal && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={proposal.proposal.proposalMetadata.title}
          description={proposal.proposal.proposalMetadata.shortDescription}
        />
      )}
      <ProposalTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <ProposalOverview
              proposal={proposal}
              error={!!newProposalError}
              loading={newProposalLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            {proposal && <VoteInfo proposal={proposal} />}
            <VotingResults proposal={proposal} proposalVotes={proposalVotes} loading={loading} />
            <ProposalLifecycle proposal={proposal} payloads={payloadData} />
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
