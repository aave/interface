import { Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { Meta } from 'src/components/Meta';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { ProposalBadgeState } from 'src/modules/governance/StateBadge';
import { ProposalDetailDisplay } from 'src/modules/governance/types';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { ipfsGateway } from 'src/ui-config/governanceConfig';

const mockProposal: ProposalDetailDisplay = {
  id: '',
  title: '',
  shortDescription: '',
  description: '',
  author: '',
  discussions: '',
  ipfsHash: '',
  badgeState: ProposalBadgeState.Created,
  voteInfo: {
    forVotes: 0,
    againstVotes: 0,
    forPercent: 0,
    againstPercent: 0,
    quorum: 0,
    quorumReached: false,
    currentDifferential: 0,
    requiredDifferential: 0,
    differentialReached: false,
  },
};

export default function IpfsPreview() {
  const router = useRouter();
  const ipfsHash = router.query.ipfsHash as string;
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<ProposalDetailDisplay>(mockProposal);
  const [error, setError] = useState(false);

  async function fetchIpfs() {
    try {
      setLoading(true);
      const proposalMetadata = await getProposalMetadata(ipfsHash, ipfsGateway);
      setProposal((prev) => ({
        ...prev,
        title: proposalMetadata.title,
        shortDescription: proposalMetadata.shortDescription,
        description: proposalMetadata.description,
        author: proposalMetadata.author,
        discussions: proposalMetadata.discussions || null,
        ipfsHash: proposalMetadata.ipfsHash,
      }));
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ipfsHash) return;
    fetchIpfs();
  }, [ipfsHash]);

  return (
    <>
      {!loading && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={proposal.title}
          description={proposal.shortDescription}
        />
      )}
      <ProposalTopPanel />

      {!loading && (
        <ContentContainer>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <ProposalOverview proposal={proposal} error={error} loading={loading} />
            </Grid>
          </Grid>
        </ContentContainer>
      )}
    </>
  );
}

IpfsPreview.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
