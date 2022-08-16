import { governanceContract } from '../modules/governance/utils/governanceProvider';
import { Ipfs } from './ipfs';
import { Proposal } from './proposal';
//import { Vote } from './vote';

/*
Voting cache is currently disabled due to issue #992
*/

export async function populateCache() {
  const count = await governanceContract.getProposalsCount();
  const ipfsFetcher = new Ipfs();
  const proposalFetcher = new Proposal();
  //const voteFetcher = new Vote();
  for (let i = 0; i < count; i++) {
    const proposal = await proposalFetcher.populate(i);
    await ipfsFetcher.populate(i, proposal);
    // await voteFetcher.populate(i, proposal.startBlock, proposal.endBlock);
  }
}
populateCache().then(() => console.log('finished'));
