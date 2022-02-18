import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import lodash from 'lodash';
import { getVotes, VoteType } from 'src/modules/governance/utils/getVotes';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { governanceConfig } from 'src/ui-config/governanceConfig';

const __dirname = dirname(fileURLToPath(import.meta.url));

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

// Use JSON file for storage
const file = join(__dirname, 'votes.json');
const adapter = new JSONFile<{ proposals: number[]; votes: VoteType[] }>(file);
const db = new LowWithLodash(adapter);
await db.read();

export class Vote {
  async get(proposalId: number, startBlock: number, endBlock: number) {
    // seed

    // fallback to empty array
    db.data ||= { votes: [], proposals: [] };

    const isCached = db.chain
      .get('proposals')
      .find((item) => proposalId === item)
      .value();
    if (isCached) {
      return db.chain
        .get('votes')
        .filter((proposal) => proposal.proposalId === proposalId)
        .value();
    }
    const provider = getProvider(governanceConfig.chainId);
    const currentBlock = await provider.getBlockNumber();
    const { votes } = await getVotes(startBlock, endBlock, currentBlock);

    votes
      .filter((v) => v.proposalId === proposalId)
      .forEach((vote) => {
        const cache = db.chain
          .get('votes')
          .find((cacheVote) => vote.transactionHash === cacheVote.transactionHash)
          .value();

        if (!cache) {
          db.data?.votes.push(vote);
        }
      });

    if (endBlock < currentBlock) {
      db.data.proposals.push(proposalId);
    }

    await db.write();
    return votes;
  }
}
