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
  const [fetchMetadataError, setFetchMetadataError] = useState(false);

  // TODO: Abstract out this recursive try/fallback approach so it may be used in other places where we fetch the proposal metadata and may have errors from the initial gateway
  async function initialize(_ipfsGateway: string, _useFallback: boolean) {
    try {
      const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
      const proposal = await enhanceProposalWithTimes(rest);
      setProposal(proposal);
      const ipfsMetadata = await getProposalMetadata(proposal.ipfsHash, _ipfsGateway);
      const newIpfs = {
        id,
        originalHash: proposal.ipfsHash,
        ...ipfsMetadata,
      };
      setIpfs(newIpfs);
    } catch (e) {
      // Recursion - Try again once with our fallback API
      // Base case: If we are retrying with our fallback and it fails, return
      // Rescursive case: If we haven't retried with our fallback yet, try it once
      if (_useFallback) {
        console.groupCollapsed('Fetching proposal metadata from IPFS...');
        console.info('failed with', _ipfsGateway);
        console.info('exiting');
        console.error(e);
        console.groupEnd();
        // To prevent continually adding onto the callstack with failed requests, return and show an error message in the UI
        setFetchMetadataError(true);
        return;
      } else {
        const fallback = governanceConfig.fallbackIpfsGateway;
        console.groupCollapsed('Fetching proposal metadata from IPFS,,,');
        console.info('failed with', _ipfsGateway);
        console.info('retrying with', fallback);
        console.error(e);
        console.groupEnd();
        initialize(fallback, true);
      }
    }
  }

  useEffect(() => {
    id && initialize(governanceConfig.ipfsGateway, false);
  }, [id]);

  return <ProposalPage ipfs={ipfs} proposal={proposal} metadataError={fetchMetadataError} />;
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
