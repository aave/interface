import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { enhanceProposalWithTimes } from 'src/modules/governance/utils/formatProposal';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';

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
  usePolling(updateProposal, 10000, proposal ? isProposalStateImmutable(proposal) : false, []);

  // fetch ipfs on initial load
  useEffect(() => {
    if (!proposal || ipfs) return;
    fetchIpfs();
  }, [proposal, ipfs]);
  // TODO: ignore for now, can just render [proposalId] later
  return (
    <div>
      {JSON.stringify(proposal)}
      {JSON.stringify(ipfs)}
    </div>
  );
}

DynamicProposal.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout headerTopLineHeight={229}>
      <GovernanceDataProvider>{page}</GovernanceDataProvider>
    </MainLayout>
  );
};
