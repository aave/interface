import { Grid } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { Meta } from 'src/components/Meta';
import { Proposal } from 'src/hooks/governance/useProposals';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalOverview } from 'src/modules/governance/proposal/ProposalOverview';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { ProposalBadgeState } from 'src/modules/governance/StateBadge';
import { ProposalLifecycleStep } from 'src/modules/governance/utils/formatProposal';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { ipfsGateway } from 'src/ui-config/governanceConfig';

// proposal metadata is fetched using the ipfs hash,
// but all other data is mocked so the page can be rendered
const mockProposal: Proposal = {
  subgraphProposal: {
    id: '',
    creator: '',
    accessLevel: '',
    ipfsHash: '',
    proposalMetadata: {
      shortDescription: '',
      aip: 1,
      title: '',
      author: '',
      discussions: '',
      ipfsHash: '',
      description: '',
    },
    state: 1,
    votingPortal: {
      id: '',
      votingMachineChainId: '',
      votingMachine: '',
      enabled: true,
    },
    votingConfig: {
      id: '1',
      cooldownBeforeVotingStart: '86400',
      votingDuration: '259200',
      yesThreshold: '320000',
      yesNoDifferential: '80000',
      minPropositionPower: '80000',
    },
    payloads: [
      {
        id: '0',
        chainId: '1',
        accessLevel: '1',
        payloadsController: '',
      },
    ],
    transactions: {
      id: '0',
      created: {
        id: '',
        blockNumber: '',
        timestamp: '',
      },
      active: null,
      queued: null,
      failed: null,
      executed: null,
      canceled: null,
    },
    votingDuration: null,
    snapshotBlockHash: '0x0',
    votes: {
      forVotes: '0',
      againstVotes: '0',
    },
    constants: {
      id: '8',
      precisionDivider: '1000000000000000000',
      cooldownPeriod: '0',
      expirationTime: '2592000',
      cancellationFee: '50000000000000000',
    },
  },
  votingMachineData: {
    proposalData: {
      id: '0',
      sentToGovernance: false,
      startTime: 0,
      endTime: 0,
      votingClosedAndSentTimestamp: 0,
      forVotes: '0',
      againstVotes: '0',
      creationBlockNumber: 0,
      votingClosedAndSentBlockNumber: 0,
    },
    votedInfo: {
      support: false,
      votingPower: '0',
    },
    strategy: '',
    dataWarehouse: '',
    votingAssets: [''],
    hasRequiredRoots: false,
    voteConfig: {
      votingDuration: '0',
      l1ProposalBlockHash: '',
    },
    state: 0,
  },
  payloadsData: [],
  lifecycleState: ProposalLifecycleStep.Created,
  badgeState: ProposalBadgeState.Created,
  votingInfo: {
    forVotes: 0,
    againstVotes: 0,
    forPercent: 0,
    againstPercent: 0,
    quorum: '80000',
    quorumReached: false,
    currentDifferential: '0',
    requiredDifferential: '320000',
    differentialReached: false,
    isPassing: false,
  },
};

export default function IpfsPreview() {
  const router = useRouter();
  const ipfsHash = router.query.ipfsHash as string;
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal>(mockProposal);
  const [error, setError] = useState(false);

  async function fetchIpfs() {
    try {
      setLoading(true);
      const proposalMetadata = await getProposalMetadata(ipfsHash, ipfsGateway);
      setProposal((prev) => {
        return {
          ...prev,
          subgraphProposalb: {
            ...prev.subgraphProposal,
            proposalMetadata,
          },
        };
      });
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
          title={proposal.subgraphProposal.proposalMetadata.title}
          description={proposal.subgraphProposal.proposalMetadata.shortDescription}
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
