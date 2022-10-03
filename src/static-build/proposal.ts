import { Proposal as ProposalType } from '@aave/contract-helpers';
import lodash from 'lodash';
import { JSONFileSync, LowSync } from 'lowdb';
import { join } from 'path';

import { enhanceProposalWithTimes } from '../modules/governance/utils/formatProposal';
import { governanceContract } from '../modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from '../modules/governance/utils/immutableStates';

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

export type CustomProposalType = Omit<ProposalType, 'values'> & {
  startTimestamp: number;
  creationTimestamp: number;
  expirationTimestamp: number;
};

// Use JSON file for storage
const file = join(process.cwd(), 'src/static-build', 'proposals.json');
const adapter = new JSONFileSync<{ proposals: CustomProposalType[] }>(file);
const db = new LowWithLodash(adapter);
db.read();

export class Proposal {
  count() {
    return db.data?.proposals?.length || 0;
  }

  get(id: number) {
    const value = db.chain.get('proposals').find({ id }).value();
    if (!value) throw new Error('trying to fetch proposal cache, but failed');
    return value;
  }

  async populate(id: number) {
    // seed
    // fallback to empty array
    db.data ||= { proposals: [] };

    const value = db.chain.get('proposals').find({ id }).value();
    if (value && isProposalStateImmutable(value)) return value;
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
    const proposal = await enhanceProposalWithTimes(rest);
    // only store data when it can no longer change
    if (value) {
      // update
      const index = db.data.proposals.findIndex((p) => p.id === id);
      db.data.proposals[index] = proposal;
    } else {
      db.data.proposals.push(proposal);
    }
    db.write();
    return proposal;
  }
}
