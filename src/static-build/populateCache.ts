import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { Ipfs } from './ipfs';
import { Proposal } from './proposal';

export async function populateCache() {
  const count = await governanceContract.getProposalsCount();
  const ipfsFetcher = new Ipfs();
  const proposalFetcher = new Proposal();
  for (let i = 0; i < count; i++) {
    const proposal = await proposalFetcher.populate(i);
    await ipfsFetcher.populate(i, proposal);
  }
}
