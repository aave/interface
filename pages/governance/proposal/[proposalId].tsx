import { useState } from 'react';
import { usePolling } from 'src/hooks/usePolling';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';

export async function getStaticPaths() {
  if (!governanceContract) return { paths: [] };
  const proposals = await governanceContract.getProposalsCount();
  const paths = [...Array(proposals).keys()].map((id) => ({
    params: { proposalId: id.toString() },
  }));

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
    <div>
      {JSON.stringify(proposal)}
      {JSON.stringify(ipfs)}
    </div>
  );
}
