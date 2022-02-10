import { Container } from '@mui/material';
import { useState } from 'react';
import { Meta } from 'src/components/Meta';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function getStaticPaths() {
  if (!governanceContract) return { paths: [] };
  const count = await governanceContract.getProposalsCount();
  const paths: { params: { proposalId: string } }[] = [];
  for (let i = 0; i < count; i++) {
    paths.push({
      params: { proposalId: i.toString() },
    });
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { proposalId: string } }) {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();

  const proposal = await ProposalFetcher.get(Number(params.proposalId));
  return {
    props: {
      proposal,
      ipfs: await IpfsFetcher.get(Number(params.proposalId)),
    },
  };
}

interface ProposalPageProps {
  ipfs: IpfsType;
  proposal: CustomProposalType;
}

export default function ProposalPage({ proposal: initialProposal, ipfs }: ProposalPageProps) {
  const [proposal, setProposal] = useState(initialProposal);

  async function updateProposal() {
    const updatedProposal = await governanceContract.getProposal({ proposalId: proposal.id });
    setProposal(updatedProposal);
  }

  usePolling(updateProposal, 10000, isProposalStateImmutable(proposal), []);
  return (
    <Container maxWidth="xl">
      <Meta title={ipfs.title} description={ipfs.shortDescription} />
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{ipfs.description}</ReactMarkdown>
    </Container>
  );
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
