import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { enhanceProposalWithTimes } from 'src/modules/governance/utils/formatProposal';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import ProposalPage from './[proposalId]';

export default function DynamicProposal() {
  const router = useRouter();
  const id = Number(router.query.proposalId);
  const [proposal, setProposal] = useState<CustomProposalType>();
  const [ipfs, setIpfs] = useState<IpfsType>();

  async function updateProposal() {
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
    setProposal(await enhanceProposalWithTimes(rest));
  }

  async function fetchIpfs() {
    if (!proposal) return;
    const newIpfs = {
      id,
      originalHash: proposal.ipfsHash,
      ...(await getProposalMetadata(proposal.ipfsHash, governanceConfig?.ipfsGateway)),
    };
    setIpfs(newIpfs);
  }

  // poll every 10s
  usePolling(
    updateProposal,
    20000,
    (proposal ? isProposalStateImmutable(proposal) : false) || !id,
    [id]
  );

  // // fetch ipfs on initial load
  useEffect(() => {
    if (!proposal || ipfs) return;
    fetchIpfs();
  }, [proposal, ipfs]);
  if (!proposal || !ipfs) return <div>loading</div>;
  return <ProposalPage ipfs={ipfs} proposal={proposal} />;
}

DynamicProposal.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <GovernanceDataProvider>
        {page}
        <GovVoteModal />
      </GovernanceDataProvider>
    </MainLayout>
  );
};
