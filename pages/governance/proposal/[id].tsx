import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';

export async function getStaticPaths() {
  if (!governanceContract) return { paths: [] };
  const proposals = await governanceContract.getProposalsCount();
  const paths = [...Array(proposals).keys()].map((id) => ({
    params: { id: id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const ipfs = new Ipfs();

  return {
    props: {
      ipfs: await ipfs.get(Number(params.id)),
    },
  };
}

interface ProposalProps {
  ipfs: IpfsType;
}

export default function Proposal(props: ProposalProps) {
  return <div>{JSON.stringify(props)}</div>;
}
