import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';
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
  const [fetchMetadataError, setFetchMetadataError] = useState(false);

  async function initialize(_ipfsGateway: string) {
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
    const proposal = await enhanceProposalWithTimes(rest);
    setProposal(proposal);

    try {
      const ipfsMetadata = await getProposalMetadata(proposal.ipfsHash, _ipfsGateway);
      const newIpfs = {
        id,
        originalHash: proposal.ipfsHash,
        ...ipfsMetadata,
      };
      setIpfs(newIpfs);
    } catch (e) {
      setFetchMetadataError(true);
    }
  }

  useEffect(() => {
    id && initialize(governanceConfig.ipfsGateway);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return <ProposalPage ipfs={ipfs} proposal={proposal} metadataError={fetchMetadataError} />;
}

DynamicProposal.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
