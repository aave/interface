import lodash from 'lodash';
import { JSONFileSync, LowSync } from 'lowdb';
import { join } from 'path';

import { getVotes, VoteType } from '../modules/governance/utils/getVotes';
import { governanceConfig } from '../ui-config/governanceConfig';
import { getProvider } from '../utils/marketsAndNetworksConfig';

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

// Use JSON file for storage
const file = join(process.cwd(), 'src/static-build', 'votes.json');
const adapter = new JSONFileSync<{ votes: VoteType[]; finished: boolean }[]>(file);
const db = new LowWithLodash(adapter);
db.read();

export class Vote {
  async get(proposalId: number) {
    const cache = db.data?.[proposalId];
    if (!cache) throw new Error(`could not resolve votes cache for ${proposalId}`);
    return cache;
  }

  async populate(proposalId: number, startBlock: number, endBlock: number) {
    // fallback to empty array
    db.data ||= [];

    const isCached = db.data[proposalId];
    if (isCached && isCached.finished) {
      return isCached;
    } else if (!isCached) {
      db.data[proposalId] = { votes: [], finished: false };
    }
    const provider = getProvider(governanceConfig.chainId);
    const currentBlock = await provider.getBlockNumber();
    const { votes } = await getVotes(startBlock, endBlock, currentBlock);

    votes
      .filter((v) => v.proposalId === proposalId)
      .forEach((vote) => {
        const cache = isCached?.votes.find(
          (cacheVote) => vote.transactionHash === cacheVote.transactionHash
        );

        if (!cache) {
          db.data?.[proposalId].votes.push(vote);
        }
      });

    if (endBlock < currentBlock) {
      db.data[proposalId].finished = true;
    }

    await db.write();
    return votes;
  }
}
