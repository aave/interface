import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { IpfsType } from 'src/static-build/ipfs';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import ProposalPage from './proposal/[proposalId].governance';

export default function IpfsPreview() {
  const router = useRouter();
  const ipfsHash = router.query.ipfsHash as string;
  const [ipfs, setIpfs] = useState<IpfsType>();

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
  return <ProposalPage ipfs={ipfs} proposal={undefined} />;
}

IpfsPreview.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <GovernanceDataProvider />
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
