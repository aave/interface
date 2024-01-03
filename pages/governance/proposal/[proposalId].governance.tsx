import { Grid } from '@mui/material';
// import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Meta } from 'src/components/Meta';
import { usePayloadsData } from 'src/hooks/governance/usePayloadsData';
import { useProposal } from 'src/hooks/governance/useProposal';
import { useGetVotingConfig } from 'src/hooks/governance/useProposals';
import { useProposalVotes } from 'src/hooks/governance/useProposalVotes';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalLifecycle } from 'src/modules/governance/proposal/ProposalLifecycle';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';
import { VotingResults } from 'src/modules/governance/proposal/VotingResults';
import { formatProposalV3 } from 'src/modules/governance/utils/formatProposal';

import { ContentContainer } from '../../../src/components/ContentContainer';

const GovVoteModal = dynamic(() =>
  import('../../../src/components/transactions/GovVote/GovVoteModal').then(
    (module) => module.GovVoteModal
  )
);

export default function ProposalPage() {
  const { query } = useRouter();
  const proposalId = (query.proposalId as string) || '0';
  const {
    data: proposal,
    isLoading: newProposalLoading,
    error: newProposalError,
  } = useProposal(+proposalId);

  const payloadParams =
    proposal?.proposalData.proposalData.payloads.map((p) => {
      return {
        payloadControllerAddress: p.payloadsController,
        payloadId: p.payloadId,
        chainId: p.chain,
      };
    }) || [];

  const { data: payloadData } = usePayloadsData(payloadParams);

  const { data: constants, isLoading: constantsLoading } = useGetVotingConfig();
  const proposalVotes = useProposalVotes({
    proposalId,
    votingChainId: proposal?.proposalData.votingChainId,
  });

  const loading = newProposalLoading || constantsLoading;

  const proposalVotingConfig = constants?.votingConfigs.find(
    (c) => c.accessLevel === proposal?.proposalData.proposalData.accessLevel
  );

  const formattedProposal =
    proposal &&
    constants &&
    formatProposalV3(
      proposal.proposal,
      proposal.proposalData,
      constants,
      proposal.votingMachineData
    );

  return (
    <>
      {proposal && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={proposal.proposal.title}
          description={proposal.proposal.shortDescription}
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
            <VotingResults
              proposal={formattedProposal}
              proposalVotes={proposalVotes}
              loading={loading}
            />
            <ProposalLifecycle
              proposal={proposal}
              payloads={payloadData}
              votingConfig={proposalVotingConfig}
            />
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
