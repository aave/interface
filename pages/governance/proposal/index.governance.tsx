import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { enhanceProposalWithTimes } from 'src/modules/governance/utils/formatProposal';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import ProposalPage from './[proposalId].governance';

export default function DynamicProposal() {
  const router = useRouter();
  const id = Number(router.query.proposalId);
  const [proposal, setProposal] = useState<CustomProposalType>();
  const [ipfs, setIpfs] = useState<IpfsType>();

  async function initialize() {
    try {
      const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
      const proposal = await enhanceProposalWithTimes(rest);
      setProposal(proposal);
      const newIpfs = {
        id,
        originalHash: proposal.ipfsHash,
        ...(await getProposalMetadata(proposal.ipfsHash, governanceConfig?.ipfsGateway)),
      };
      setIpfs(newIpfs);
    } catch (e) {
      console.log(e);
      setTimeout(initialize, 5000);
    }
  }

  useEffect(() => {
    id && initialize();
  }, [id]);

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
