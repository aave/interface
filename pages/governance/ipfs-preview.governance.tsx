import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MainLayout } from 'src/layouts/MainLayout';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { IpfsType } from 'src/static-build/ipfs';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import ProposalPage from './proposal/[proposalId].governance';

const GovVoteModal = dynamic(() =>
  import('src/components/transactions/GovVote/GovVoteModal').then((module) => module.GovVoteModal)
);

export default function IpfsPreview() {
  const router = useRouter();
  const ipfsHash = router.query.ipfsHash as string;
  const [, setIpfs] = useState<IpfsType>();
  async function fetchIpfs() {
    const proposalMetadata = await getProposalMetadata(ipfsHash, governanceConfig.ipfsGateway);
    const newIpfs = {
      id: -1,
      originalHash: ipfsHash,
      ...proposalMetadata,
    };
    setIpfs(newIpfs);
  }
  // // fetch ipfs on initial load
  useEffect(() => {
    if (!ipfsHash) return;
    fetchIpfs();
  }, [ipfsHash]);
  return <ProposalPage />;
}

IpfsPreview.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
