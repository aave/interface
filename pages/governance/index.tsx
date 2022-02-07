import { ProposalState } from '@aave/contract-helpers';
import { InferGetStaticPropsType } from 'next';
import { useState } from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { Ipfs } from 'src/static-build/ipfs';
import { Proposal } from 'src/static-build/proposal';

export const getStaticProps = async () => {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();
  const count = await governanceContract.getProposalsCount();

  const proposals = await Promise.all(
    [...Array(count).keys()].reverse().map(async (id) => {
      // TODO: only pass required ipfs data
      const ipfs = await IpfsFetcher.get(id);
      const proposal = await ProposalFetcher.get(id);
      return {
        ipfs,
        proposal,
        prerendered: true,
      };
    })
  );

  return { props: { proposals } };
};

export default function Governance(props: InferGetStaticPropsType<typeof getStaticProps>) {
  const [proposals, setProposals] = useState(props.proposals);

  async function fetchNewProposals() {
    const count = await governanceContract.getProposalsCount();
    const nextProposals: InferGetStaticPropsType<typeof getStaticProps>['proposals'] = [];
    console.log(`fetching ${count - proposals.length} new proposals`);
    for (let i = proposals.length; i < count; i++) {
      const proposal = await governanceContract.getProposal({ proposalId: i });
      nextProposals.push({
        ipfs: {
          id: i,
          originalHash: proposal.ipfsHash,
          ...(await getProposalMetadata(proposal.ipfsHash, process.env.NEXT_PUBLIC_IPFS_GATEWAY)),
        },
        proposal: proposal,
        prerendered: false,
      });
    }
    setProposals((p) => [...nextProposals.reverse(), ...p]);
  }

  async function updatePendingProposals() {
    const pendingProposals = proposals.filter(
      ({ proposal }) => !isProposalStateImmutable(proposal)
    );

    if (pendingProposals.length) {
      const copy = [...proposals];
      for (const { proposal } of pendingProposals) {
        copy[proposal.id].proposal = await governanceContract.getProposal({
          proposalId: proposal.id,
        });
      }
      setProposals(copy);
    }
  }

  usePolling(fetchNewProposals, 30000, false, []);
  usePolling(updatePendingProposals, 10000, false, []);

  return (
    <div>
      {proposals.map(({ proposal, prerendered, ipfs }) => (
        <div key={proposal.id}>
          <Link
            href={
              prerendered
                ? ROUTES.prerenderedProposal(proposal.id)
                : ROUTES.dynamicRenderedProposal(proposal.id)
            }
          >
            {ipfs.title}
          </Link>
        </div>
      ))}
    </div>
  );
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
